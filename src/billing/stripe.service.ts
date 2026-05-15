import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SystemService } from '../system/system.service';

@Injectable()
export class StripeService {
  private defaultStripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private systemService: SystemService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not found in configuration');
    }

    this.defaultStripe = new Stripe(secretKey || 'dummy_key', {
      apiVersion: '2026-01-28.clover' as any,
    });
  }

  async getStripeClient(): Promise<Stripe> {
    const config = await this.systemService.getConfig();
    const dbKey = config.stripeSecretKey;

    if (dbKey && dbKey.startsWith('sk_')) {
      return new Stripe(dbKey, {
        apiVersion: '2026-01-28.clover' as any,
      });
    }

    return this.defaultStripe;
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: Record<string, string>) {
    try {
      const stripe = await this.getStripeClient();

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(`Stripe Error: ${error.message}`);
      throw new InternalServerErrorException('Payment processing failed');
    }
  }

  // ── Customers ────────────────────────────────────────────────────────────

  async createCustomer(userId: string, email: string, name: string): Promise<Stripe.Customer> {
    try {
      const stripe = await this.getStripeClient();
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId },
      });
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer: ${error.message}`);
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const stripe = await this.getStripeClient();
      return await stripe.customers.retrieve(customerId) as Stripe.Customer;
    } catch (error) {
      this.logger.error(`Failed to retrieve Stripe customer: ${error.message}`);
      throw new NotFoundException('Customer not found');
    }
  }

  // ── Subscriptions ────────────────────────────────────────────────────────

  async createSubscription(customerId: string, priceId: string, options?: {
    trialPeriodDays?: number;
    metadata?: Record<string, string>;
    coupon?: string;
  }) {
    try {
      const stripe = await this.getStripeClient();
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: options?.trialPeriodDays,
        metadata: options?.metadata,
        discounts: options?.coupon ? [{ coupon: options.coupon }] : undefined,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw new InternalServerErrorException('Subscription creation failed');
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const stripe = await this.getStripeClient();
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw new InternalServerErrorException('Subscription cancellation failed');
    }
  }

  async updateSubscription(subscriptionId: string, priceId: string) {
    try {
      const stripe = await this.getStripeClient();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const currentItem = subscription.items.data[0];

      if (!currentItem) {
        throw new NotFoundException('No subscription item found');
      }

      const updated = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: currentItem.id,
          price: priceId,
        }],
        proration_behavior: 'create_prorations',
      });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update subscription: ${error.message}`);
      throw new InternalServerErrorException('Subscription update failed');
    }
  }

  async listSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const stripe = await this.getStripeClient();
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 100,
      });
      return subscriptions.data;
    } catch (error) {
      this.logger.error(`Failed to list subscriptions: ${error.message}`);
      throw new InternalServerErrorException('Failed to list subscriptions');
    }
  }

  // ── Refunds ──────────────────────────────────────────────────────────────

  async createRefund(paymentIntentId: string, amount?: number) {
    try {
      const stripe = await this.getStripeClient();
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`);
      throw new InternalServerErrorException('Refund processing failed');
    }
  }

  // ── Coupons / Promos ─────────────────────────────────────────────────────

  async createCoupon(data: {
    code: string;
    percentOff?: number;
    amountOff?: number;
    currency?: string;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths?: number;
    maxRedemptions?: number;
    redeemBy?: Date;
  }) {
    try {
      const stripe = await this.getStripeClient();
      const coupon = await stripe.coupons.create({
        name: data.code,
        percent_off: data.percentOff,
        amount_off: data.amountOff,
        currency: data.currency,
        duration: data.duration,
        duration_in_months: data.durationInMonths,
        max_redemptions: data.maxRedemptions,
        redeem_by: data.redeemBy ? Math.floor(data.redeemBy.getTime() / 1000) : undefined,
      });
      return coupon;
    } catch (error) {
      this.logger.error(`Failed to create coupon: ${error.message}`);
      throw new InternalServerErrorException('Coupon creation failed');
    }
  }

  async listCoupons(): Promise<Stripe.Coupon[]> {
    try {
      const stripe = await this.getStripeClient();
      const coupons = await stripe.coupons.list({ limit: 100 });
      return coupons.data;
    } catch (error) {
      this.logger.error(`Failed to list coupons: ${error.message}`);
      throw new InternalServerErrorException('Failed to list coupons');
    }
  }

  async validateCoupon(code: string) {
    try {
      const stripe = await this.getStripeClient();
      const coupons = await stripe.coupons.list({ limit: 100 });

      const coupon = coupons.data.find(
        (c) => c.name?.toLowerCase() === code.toLowerCase() && c.valid,
      );

      if (!coupon) {
        throw new BadRequestException('Invalid or expired coupon code');
      }

      return {
        valid: true,
        id: coupon.id,
        name: coupon.name,
        percentOff: coupon.percent_off,
        amountOff: coupon.amount_off,
        currency: coupon.currency,
        duration: coupon.duration,
        durationInMonths: coupon.duration_in_months,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to validate coupon: ${error.message}`);
      throw new InternalServerErrorException('Coupon validation failed');
    }
  }

  // ── Webhook helpers ──────────────────────────────────────────────────────

  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    return this.defaultStripe.webhooks.constructEvent(payload, signature, secret);
  }
}
