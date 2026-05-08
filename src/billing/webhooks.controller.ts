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

@Controller('webhooks')
export class WebhooksController {
  private stripe: Stripe;
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {
    const secretKey =
      this.configService.get('STRIPE_SECRET_KEY') ||
      'dummy_key_for_initialization';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover' as any,
    });
  }

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

    // Re-initialize Stripe with actual key for webhook verification
    const actualSecretKey =
      this.configService.get('STRIPE_SECRET_KEY') || 'dummy_key';
    this.stripe = new Stripe(actualSecretKey, {
      apiVersion: '2026-01-28.clover' as any,
    });

    let event: Stripe.Event;

    try {
      if (endpointSecret) {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          endpointSecret,
        );
      } else {
        // SECURITY WARNING: No webhook secret configured
        // In production, always verify webhooks with signature
        this.logger.warn(
          'No STRIPE_WEBHOOK_SECRET configured. Webhook signature verification skipped.',
        );
        this.logger.warn(
          'This is insecure in production. Please set STRIPE_WEBHOOK_SECRET environment variable.',
        );

        // In development mode only, we can parse without verification
        // But log a clear warning
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

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object);
        break;

      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    this.logger.log('PaymentIntent was successful:', paymentIntent.id);

    // Update order status
    if (paymentIntent.metadata?.orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: paymentIntent.metadata.orderId },
        relations: ['user'],
      });

      if (order) {
        // Use transaction for atomic order status update and transaction creation
        await this.dataSource.transaction(async (manager) => {
          order.status = 'completed';
          await manager.save(order);

          // Create transaction record
          const transaction = manager.create(Transaction, {
            invoiceId: `INV-${Date.now()}`,
            amount: `$${(paymentIntent.amount / 100).toFixed(2)}`,
            type: 'Payment',
            status: 'completed',
            user: order.user,
          });

          await manager.save(transaction);
        });

        // Send order confirmation email (outside transaction)
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

    if (paymentIntent.metadata?.orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: paymentIntent.metadata.orderId },
        relations: ['user'],
      });

      if (order) {
        // Use transaction for atomic order status update and transaction creation
        await this.dataSource.transaction(async (manager) => {
          order.status = 'cancelled';
          await manager.save(order);

          // Create failed transaction record
          const transaction = manager.create(Transaction, {
            invoiceId: `INV-${Date.now()}`,
            amount: `$${(paymentIntent.amount / 100).toFixed(2)}`,
            type: 'Payment Failed',
            status: 'failed',
            user: order.user,
          });

          await manager.save(transaction);
        });

        this.logger.log(`Order ${order.id} marked as cancelled`);
      }
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    this.logger.log('Invoice paid:', invoice.id);
    // Handle subscription invoice payment
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.log('Invoice payment failed:', invoice.id);
    // Handle failed subscription payment
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    this.logger.log('Subscription created:', subscription.id);
    // Handle new subscription
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log('Subscription updated:', subscription.id);
    // Handle subscription update
  }

  private async handleChargeRefunded(charge: Stripe.Charge) {
    this.logger.log('Charge refunded:', charge.id);

    // Find transaction by searching for related order
    // Note: Since Transaction doesn't have stripePaymentIntentId, we'll log this
    this.logger.log(
      `Refund processed for charge: ${charge.id}, amount: ${charge.amount_refunded / 100}`,
    );
  }
}
