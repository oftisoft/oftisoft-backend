import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { AdminBillingController } from './admin-billing.controller';

import { StripeService } from './stripe.service';

import { SystemModule } from '../system/system.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentMethod, Transaction, User]),
        SystemModule
    ],
    controllers: [BillingController, AdminBillingController],
    providers: [BillingService, StripeService],
    exports: [BillingService, StripeService],
})
export class BillingModule { }
