import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { StripeService } from './stripe.service';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly stripeService: StripeService,
  ) {}

  // ── Payment Intents ──────────────────────────────────────────────────────

  @Post('create-payment-intent')
  async createPaymentIntent(
    @GetUser() user: User,
    @Body() body: { amount: number; currency?: string },
  ) {
    return this.stripeService.createPaymentIntent(
      body.amount,
      body.currency,
      { userId: user.id },
    );
  }

  // ── Coupons ──────────────────────────────────────────────────────────────

  @Get('coupons')
  async listCoupons() {
    return this.stripeService.listCoupons();
  }

  @Post('validate-coupon')
  async validateCoupon(@Body('code') code: string) {
    return this.stripeService.validateCoupon(code);
  }

  @Post('create-coupon')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'Admin')
  async createCoupon(
    @Body() body: {
      code: string;
      percentOff?: number;
      amountOff?: number;
      currency?: string;
      duration: 'once' | 'repeating' | 'forever';
      durationInMonths?: number;
      maxRedemptions?: number;
      redeemBy?: Date;
    },
  ) {
    return this.stripeService.createCoupon(body);
  }

  // ── Subscriptions ────────────────────────────────────────────────────────

  @Post('create-subscription')
  async createSubscription(
    @GetUser() user: User,
    @Body() body: { priceId: string; trialPeriodDays?: number; coupon?: string },
  ) {
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripeService.createCustomer(
        user.id,
        user.email,
        user.name,
      );
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await this.billingService.saveUser(user);
    }

    const subscription = await this.stripeService.createSubscription(
      customerId,
      body.priceId,
      {
        trialPeriodDays: body.trialPeriodDays,
        coupon: body.coupon,
        metadata: { userId: user.id },
      },
    );

    user.subscriptionStatus = subscription.status;
    await this.billingService.saveUser(user);

    return subscription;
  }

  @Post('cancel-subscription')
  async cancelSubscription(
    @Body() body: { subscriptionId: string },
  ) {
    return this.stripeService.cancelSubscription(body.subscriptionId);
  }

  @Post('update-subscription')
  async updateSubscriptionPlan(
    @Body() body: { subscriptionId: string; priceId: string },
  ) {
    return this.stripeService.updateSubscription(body.subscriptionId, body.priceId);
  }

  // ── Refunds ──────────────────────────────────────────────────────────────

  @Post('create-refund')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'Admin')
  async createRefund(
    @Body() body: { paymentIntentId: string; amount?: number },
  ) {
    return this.stripeService.createRefund(body.paymentIntentId, body.amount);
  }

  // ── Payment Methods ──────────────────────────────────────────────────────

  @Get('payment-methods')
  async getPaymentMethods(@GetUser() user: User) {
    return this.billingService.getPaymentMethods(user);
  }

  @Post('payment-methods')
  addPaymentMethod(@GetUser() user: User, @Body() data: any) {
    return this.billingService.addPaymentMethod(user, data);
  }

  @Patch('payment-methods/:id/default')
  setDefault(@GetUser() user: User, @Param('id') id: string) {
    return this.billingService.setDefaultPaymentMethod(user, id);
  }

  @Delete('payment-methods/:id')
  deletePaymentMethod(@GetUser() user: User, @Param('id') id: string) {
    return this.billingService.deletePaymentMethod(user, id);
  }

  // ── Transactions ─────────────────────────────────────────────────────────

  @Get('transactions')
  async getTransactions(@GetUser() user: User, @Query('limit') limit?: string) {
    const take = limit ? Math.min(parseInt(limit, 10) || 50, 500) : 100;
    return this.billingService.getTransactions(user, take);
  }

  @Post('transactions')
  async createTransaction(
    @GetUser() user: User,
    @Body()
    body: { invoiceId?: string; amount: string; type: string; status?: string },
  ) {
    return this.billingService.createTransaction(user, {
      invoiceId: body.invoiceId || `INV-${Date.now()}`,
      amount: body.amount,
      type: body.type,
      status: body.status || 'pending',
    });
  }

  // ── Subscription info ────────────────────────────────────────────────────

  @Get('subscription')
  async getSubscription(@GetUser() user: User) {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return {
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      nextBillingDate: nextMonth.toISOString().slice(0, 10),
    };
  }

  @Patch('subscription')
  async updateSubscription(@GetUser() user: User, @Body('plan') plan: string) {
    return this.billingService.updateSubscription(user, plan);
  }

  // ── Usage ────────────────────────────────────────────────────────────────

  @Get('usage')
  async getUsageStats(@GetUser() user: User) {
    return this.billingService.getUsageStats(user);
  }
}
