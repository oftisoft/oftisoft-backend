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

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() body: { amount: number; currency?: string },
  ) {
    return this.stripeService.createPaymentIntent(body.amount, body.currency);
  }

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

  @Get('usage')
  async getUsageStats(@GetUser() user: User) {
    return this.billingService.getUsageStats(user);
  }
}
