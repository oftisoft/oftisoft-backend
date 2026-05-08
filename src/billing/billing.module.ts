import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { TaxService } from './tax.service';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { TaxRate } from '../entities/tax-rate.entity';
import { Order } from '../entities/order.entity';
import { AdminBillingController } from './admin-billing.controller';
import { AffiliateWithdrawal } from '../entities/affiliate-withdrawal.entity';
import { Affiliate } from '../entities/affiliate.entity';
import { StripeService } from './stripe.service';
import { SystemModule } from '../system/system.module';
import { WebhooksController } from './webhooks.controller';
import { EmailService } from '../auth/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentMethod,
      Transaction,
      User,
      AffiliateWithdrawal,
      Affiliate,
      TaxRate,
      Order,
    ]),
    SystemModule,
  ],
  controllers: [BillingController, AdminBillingController, WebhooksController],
  providers: [BillingService, StripeService, TaxService, EmailService],
  exports: [BillingService, StripeService, TaxService],
})
export class BillingModule {}
