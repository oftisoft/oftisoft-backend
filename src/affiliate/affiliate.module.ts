import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliateController } from './affiliate.controller';
import { AffiliateService } from './affiliate.service';
import { Affiliate } from '../entities/affiliate.entity';
import { AffiliateCommission } from '../entities/affiliate-commission.entity';
import { AffiliateWithdrawal } from '../entities/affiliate-withdrawal.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Affiliate, AffiliateCommission, AffiliateWithdrawal]),
    ],
    controllers: [AffiliateController],
    providers: [AffiliateService],
    exports: [AffiliateService],
})
export class AffiliateModule { }
