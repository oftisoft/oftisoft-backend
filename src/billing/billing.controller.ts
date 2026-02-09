import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
    Patch,
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
    ) { }

    @Post('create-payment-intent')
    async createPaymentIntent(@Body() body: { amount: number; currency?: string }) {
        return this.stripeService.createPaymentIntent(body.amount, body.currency);
    }

    @Get('payment-methods')
    async getPaymentMethods(@GetUser() user: User) {
        // Seed data for demo purposes if empty
        await this.billingService.seedInitialData(user);
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
    async getTransactions(@GetUser() user: User) {
        return this.billingService.getTransactions(user);
    }

    @Get('subscription')
    async getSubscription(@GetUser() user: User) {
        return {
            plan: user.subscriptionPlan,
            status: user.subscriptionStatus,
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
