import {
  Controller,
  Post,
  Headers,
  Req,
  Res,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Stripe from 'stripe';
import { Order } from '../entities/order.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { EmailService } from '../auth/email.service';
import { StripeService } from './stripe.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
    private stripeService: StripeService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload = req.body;
    const endpointSecret =
      this.configService.get('STRIPE_WEBHOOK_SECRET') || '';

    let event: Stripe.Event;

    try {
      if (endpointSecret) {
        event = this.stripeService.constructWebhookEvent(
          payload,
          signature,
          endpointSecret,
        );
      } else {
        this.logger.warn(
          'No STRIPE_WEBHOOK_SECRET configured. Webhook signature verification skipped.',
        );
        this.logger.warn(
          'This is insecure in production. Please set STRIPE_WEBHOOK_SECRET environment variable.',
        );

        if (process.env.NODE_ENV === 'production') {
          throw new BadRequestException(
            'Webhook secret not configured. Cannot verify webhook signature in production.',
          );
        }

        try {
          event = JSON.parse(payload.toString());
        } catch (parseError) {
          throw new BadRequestException('Invalid webhook payload');
        }
      }
    } catch (err: any) {
      this.logger.error('Webhook signature verification failed:', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log('Received Stripe webhook:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log('PaymentIntent was successful:', paymentIntent.id);

    await this.transactionRepository.update(
      { stripePaymentIntentId: paymentIntent.id },
      { status: 'completed' },
    );

    if (paymentIntent.metadata?.orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: paymentIntent.metadata.orderId },
        relations: ['user'],
      });

      if (order) {
        await this.dataSource.transaction(async (manager) => {
          order.status = 'completed';
          await manager.save(order);

          const transaction = manager.create(Transaction, {
            invoiceId: `INV-${Date.now()}`,
            amount: `$${(paymentIntent.amount / 100).toFixed(2)}`,
            type: 'Payment',
            status: 'completed',
            user: order.user,
            stripePaymentIntentId: paymentIntent.id,
          });
          await manager.save(transaction);
        });

        if (order.user) {
          try {
            await this.emailService.sendOrderConfirmationEmail(
              order.user.email,
              order,
            );
          } catch (emailError) {
            this.logger.error(
              'Failed to send order confirmation email:',
              emailError,
            );
          }
        }

        this.logger.log(`Order ${order.id} marked as completed`);
      }
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log('PaymentIntent failed:', paymentIntent.id);

    await this.transactionRepository.update(
      { stripePaymentIntentId: paymentIntent.id },
      { status: 'failed' },
    );

    if (paymentIntent.metadata?.orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: paymentIntent.metadata.orderId },
        relations: ['user'],
      });

      if (order) {
        await this.dataSource.transaction(async (manager) => {
          order.status = 'cancelled';
          await manager.save(order);

          const transaction = manager.create(Transaction, {
            invoiceId: `INV-${Date.now()}`,
            amount: `$${(paymentIntent.amount / 100).toFixed(2)}`,
            type: 'Payment Failed',
            status: 'failed',
            user: order.user,
            stripePaymentIntentId: paymentIntent.id,
          });
          await manager.save(transaction);
        });

        this.logger.log(`Order ${order.id} marked as cancelled`);
      }
    }
  }

  private async handleInvoicePaid(invoice: any) {
    this.logger.log('Invoice paid:', invoice.id);

    const subscriptionId = invoice.parent?.subscription_details?.subscription;

    if (subscriptionId && invoice.customer) {
      const customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer.id;

      const user = await this.userRepository.findOne({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        user.subscriptionStatus = 'active';
        await this.userRepository.save(user);

        const pi = invoice.payment_intent;
        const paymentIntentId = pi
          ? typeof pi === 'string' ? pi : pi.id
          : undefined;

        const transaction = this.transactionRepository.create({
          invoiceId: `INV-${Date.now()}`,
          amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
          type: 'Subscription Payment',
          status: 'completed',
          user,
          stripePaymentIntentId: paymentIntentId,
        });
        await this.transactionRepository.save(transaction);

        this.logger.log(`User ${user.id} subscription payment confirmed`);
      }
    }
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    this.logger.log('Invoice payment failed:', invoice.id);

    const subscriptionId = invoice.parent?.subscription_details?.subscription;

    if (subscriptionId && invoice.customer) {
      const customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer.id;

      const user = await this.userRepository.findOne({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        user.subscriptionStatus = 'past_due';
        await this.userRepository.save(user);

        const transaction = this.transactionRepository.create({
          invoiceId: `INV-${Date.now()}`,
          amount: `$${(invoice.amount_due / 100).toFixed(2)}`,
          type: 'Subscription Payment Failed',
          status: 'failed',
          user,
        });
        await this.transactionRepository.save(transaction);

        this.logger.log(`User ${user.id} subscription payment failed`);
      }
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    this.logger.log('Subscription created:', subscription.id);

    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    const user = await this.userRepository.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (user) {
      user.subscriptionStatus = subscription.status;
      await this.userRepository.save(user);
      this.logger.log(`User ${user.id} subscription status: ${subscription.status}`);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log('Subscription updated:', subscription.id);

    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    const user = await this.userRepository.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (user) {
      user.subscriptionStatus = subscription.status;
      await this.userRepository.save(user);
      this.logger.log(`User ${user.id} subscription updated: ${subscription.status}`);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log('Subscription deleted:', subscription.id);

    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    const user = await this.userRepository.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (user) {
      user.subscriptionPlan = 'Starter';
      user.subscriptionStatus = 'canceled';
      await this.userRepository.save(user);
      this.logger.log(`User ${user.id} subscription cancelled`);
    }
  }

  private async handleChargeRefunded(charge: Stripe.Charge) {
    this.logger.log('Charge refunded:', charge.id);

    const paymentIntentId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;

    if (paymentIntentId) {
      const refundedAmount = charge.amount_refunded / 100;
      const transaction = await this.transactionRepository.findOne({
        where: { stripePaymentIntentId: paymentIntentId },
        relations: ['user'],
      });

      if (transaction) {
        const refundTransaction = this.transactionRepository.create({
          invoiceId: `RFND-${Date.now()}`,
          amount: `$${refundedAmount.toFixed(2)}`,
          type: 'Refund',
          status: 'completed',
          user: transaction.user,
        });
        await this.transactionRepository.save(refundTransaction);

        this.logger.log(
          `Refund of $${refundedAmount} for payment ${paymentIntentId} recorded`,
        );
      } else {
        this.logger.warn(
          `No local transaction found for payment intent ${paymentIntentId}`,
        );
      }
    }
  }
}
