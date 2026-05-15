import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { Ticket } from '../entities/ticket.entity';
import { SiteVisit } from '../entities/site-visit.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Review } from '../entities/review.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';
import { Favorite } from '../entities/favorite.entity';
import { DownloadRecord } from '../entities/download-record.entity';
import { Affiliate } from '../entities/affiliate.entity';
import { AffiliateCommission } from '../entities/affiliate-commission.entity';
import { AffiliateWithdrawal } from '../entities/affiliate-withdrawal.entity';
import { Project } from '../entities/project.entity';
import { Quote } from '../entities/quote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    User, Transaction, Ticket, SiteVisit,
    Order, OrderItem, Review, Message, Notification,
    Favorite, DownloadRecord, Affiliate, AffiliateCommission,
    AffiliateWithdrawal, Project, Quote,
  ])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
