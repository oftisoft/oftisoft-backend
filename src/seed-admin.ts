import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Favorite } from './entities/favorite.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { Project } from './entities/project.entity';
import { Review } from './entities/review.entity';
import { Notification } from './entities/notification.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Transaction } from './entities/transaction.entity';
import { DownloadRecord } from './entities/download-record.entity';
import { UserAsset } from './entities/user-asset.entity';
import { Quote } from './entities/quote.entity';
import { ApiKey } from './entities/api-key.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { ProductVersion } from './entities/product-version.entity';
import { UpdateNotification } from './entities/update-notification.entity';
import { Coupon } from './entities/coupon.entity';
import { Bundle } from './entities/bundle.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { PageContent } from './entities/page-content.entity';
import { Lead } from './entities/lead.entity';
import { Ad } from './entities/ad.entity';
import { SiteVisit } from './entities/site-visit.entity';
import { SiteEvent } from './entities/site-event.entity';
import { Affiliate } from './entities/affiliate.entity';
import { AffiliateCommission } from './entities/affiliate-commission.entity';
import { AffiliateWithdrawal } from './entities/affiliate-withdrawal.entity';
import { FailedLoginAttempt } from './entities/failed-login-attempt.entity';
import { TaxRate } from './entities/tax-rate.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SystemConfig } from './entities/system-config.entity';
import { Category } from './entities/category.entity';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { Campaign } from './entities/campaign.entity';
import { Post } from './entities/post.entity';
import { Tag } from './entities/tag.entity';
import { Integration } from './entities/integration.entity';
import { HomeSection } from './entities/home-section.entity';

// Load environment variables
config();

async function seedAdmin() {
  console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
  console.log('DATABASE_USER:', process.env.DATABASE_USER);
  console.log('DATABASE_NAME:', process.env.DATABASE_NAME);

  // Validate environment variables
  if (
    !process.env.DATABASE_HOST ||
    !process.env.DATABASE_USER ||
    !process.env.DATABASE_PASSWORD ||
    !process.env.DATABASE_NAME
  ) {
    console.error('Missing required database environment variables');
    console.error(
      'Make sure .env file exists and contains DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME',
    );
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User, RefreshToken, Favorite, Product, Order, OrderItem, Ticket, TicketMessage, Project, Review, Notification, PaymentMethod, Transaction, DownloadRecord, UserAsset, Quote, ApiKey, BlockedUser, EmailVerificationToken, ProductVersion, UpdateNotification, Coupon, Bundle, SubscriptionPlan, Conversation, Message, PageContent, Lead, Ad, SiteVisit, SiteEvent, Affiliate, AffiliateCommission, AffiliateWithdrawal, FailedLoginAttempt, TaxRate, AuditLog, SystemConfig, Category, Event, EventRegistration, Campaign, Post, Tag, Integration, HomeSection],
    ssl:
      process.env.DATABASE_SSLMODE === 'require'
        ? { rejectUnauthorized: false }
        : false,
  });

  await dataSource.initialize();
  console.log('Database connected');

  const userRepository = dataSource.getRepository(User);

  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'raselhossain8666@gmail.com' },
  });

  if (existingAdmin) {
    // Update to SuperAdmin if exists
    existingAdmin.role = 'SuperAdmin';
    existingAdmin.isActive = true;
    existingAdmin.isEmailVerified = true;
    await userRepository.save(existingAdmin);
    console.log('Existing user updated to SuperAdmin:', existingAdmin.email);
  } else {
    // Create new SuperAdmin
    const hashedPassword = await bcrypt.hash('Admin123@@', 12);

    const admin = userRepository.create({
      email: 'raselhossain8666@gmail.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SuperAdmin',
      isActive: true,
      isEmailVerified: true,
      subscriptionPlan: 'Business',
      subscriptionStatus: 'active',
    });

    await userRepository.save(admin);
    console.log('SuperAdmin created:', admin.email);
  }

  await dataSource.destroy();
  console.log('Seeding completed');
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
