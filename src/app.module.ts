import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SupportModule } from './support/support.module';
import { BillingModule } from './billing/billing.module';
import { SystemModule } from './system/system.module';
import { UsersModule } from './users/users.module';
import { DownloadsModule } from './downloads/downloads.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MarketingModule } from './marketing/marketing.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ProjectsModule } from './projects/projects.module';
import { QuotesModule } from './quotes/quotes.module';
import { ContentModule } from './content/content.module';
import { LeadModule } from './leads/leads.module';
import { AdsModule } from './ads/ads.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AuditModule } from './audit/audit.module';
import { BlogSeederModule } from './blog-seeder/blog-seeder.module';
import { EventsModule } from './events/events.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AdminModule } from './admin/admin.module';
import { HomeSectionsModule } from './home-sections/home-sections.module';
import { CommentsModule } from './comments/comments.module';

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
        port: parseInt(
          configService.get<string>('DATABASE_PORT') || '5432',
          10,
        ),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        ssl: configService.get('DATABASE_SSLMODE') === 'require'
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
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
    WebsocketModule,
    BlogSeederModule,
    EventsModule,
    CampaignsModule,
    PostsModule,
    TagsModule,
    IntegrationsModule,
    AdminModule,
    HomeSectionsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
