import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { SiteVisit } from '../entities/site-visit.entity';
import { SiteEvent } from '../entities/site-event.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SiteVisit,
      SiteEvent,
      Order,
      OrderItem,
      User,
      Project,
    ]),
    CacheModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
