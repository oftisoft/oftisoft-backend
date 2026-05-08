import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { Coupon } from '../entities/coupon.entity';
import { Bundle } from '../entities/bundle.entity';
import { Product } from '../entities/product.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, Bundle, Product, SubscriptionPlan]),
  ],
  controllers: [MarketingController],
  providers: [MarketingService],
})
export class MarketingModule {}
