import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Transaction } from './entities/transaction.entity';
import { SystemConfig } from './entities/system-config.entity';
import { ApiKey } from './entities/api-key.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { SupportModule } from './support/support.module';
import { BillingModule } from './billing/billing.module';
import { SystemModule } from './system/system.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DownloadsModule } from './downloads/downloads.module';
import { Product } from './entities/product.entity';
import { UserAsset } from './entities/user-asset.entity';
import { DownloadRecord } from './entities/download-record.entity';
import { UpdateNotification } from './entities/update-notification.entity';
import { ProductVersion } from './entities/product-version.entity';
import { FavoritesModule } from './favorites/favorites.module';
import { Favorite } from './entities/favorite.entity';
import { MarketingModule } from './marketing/marketing.module';
import { Coupon } from './entities/coupon.entity';
import { Bundle } from './entities/bundle.entity';
import { MessagesModule } from './messages/messages.module';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './entities/notification.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './entities/category.entity';
import { ProjectsModule } from './projects/projects.module';
import { Project } from './entities/project.entity';
import { QuotesModule } from './quotes/quotes.module';
import { Quote } from './entities/quote.entity';
import { ContentModule } from './content/content.module';
import { PageContent } from './entities/page-content.entity';
import { Lead } from './entities/lead.entity';
import { LeadModule } from './leads/leads.module';
import { Ad } from './entities/ad.entity';
import { AdsModule } from './ads/ads.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SiteVisit } from './entities/site-visit.entity';
import { SiteEvent } from './entities/site-event.entity';
import { AffiliateModule } from './affiliate/affiliate.module';
import { Affiliate } from './entities/affiliate.entity';
import { AffiliateCommission } from './entities/affiliate-commission.entity';
import { AffiliateWithdrawal } from './entities/affiliate-withdrawal.entity';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: parseInt(configService.get<string>('DATABASE_PORT') || '5432', 10),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        ssl: configService.get('DATABASE_SSLMODE') === 'require' ? { rejectUnauthorized: false } : false,
        entities: [User, RefreshToken, Ticket, TicketMessage, PaymentMethod, Transaction, SystemConfig, ApiKey, EmailTemplate, Product, UserAsset, DownloadRecord, UpdateNotification, ProductVersion, Favorite, Coupon, Bundle, Message, Conversation, Notification, Order, OrderItem, Category, Project, Quote, PageContent, Lead, Ad, SiteVisit, SiteEvent, Affiliate, AffiliateCommission, AffiliateWithdrawal],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    SupportModule,
    BillingModule,
    SystemModule,
    UsersModule,
    DownloadsModule,
    FavoritesModule,
    MarketingModule,
    MessagesModule,
    NotificationsModule,
    OrdersModule,
    ProductsModule,
    CategoriesModule,
    ProjectsModule,
    QuotesModule,
    ContentModule,
    LeadModule,
    AdsModule,
    ReviewsModule,
    AnalyticsModule,
    AffiliateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
