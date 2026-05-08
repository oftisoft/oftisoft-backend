import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliateController } from './affiliate.controller';
import { AffiliateService } from './affiliate.service';
import { AffiliateAdminController } from './affiliate-admin.controller';
import { AffiliateAdminService } from './affiliate-admin.service';
import { Affiliate } from '../entities/affiliate.entity';
import { AffiliateCommission } from '../entities/affiliate-commission.entity';
import { AffiliateWithdrawal } from '../entities/affiliate-withdrawal.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Affiliate,
      AffiliateCommission,
      AffiliateWithdrawal,
      User,
    ]),
  ],
  controllers: [AffiliateController, AffiliateAdminController],
  providers: [AffiliateService, AffiliateAdminService],
  exports: [AffiliateService, AffiliateAdminService],
})
export class AffiliateModule {}
