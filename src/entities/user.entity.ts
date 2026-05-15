import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { RefreshToken } from './refresh-token.entity';
import { Favorite } from './favorite.entity';
import { Order } from './order.entity';
import { Ticket } from './ticket.entity';
import { Project } from './project.entity';
import { Review } from './review.entity';
import { Notification } from './notification.entity';
import { PaymentMethod } from './payment-method.entity';
import { Transaction } from './transaction.entity';
import { DownloadRecord } from './download-record.entity';
import { UserAsset } from './user-asset.entity';
import { Quote } from './quote.entity';
import { ApiKey } from './api-key.entity';
import { BlockedUser } from './blocked-user.entity';
import { EmailVerificationToken } from './email-verification-token.entity';
import { Product } from './product.entity';
import { Portfolio } from './portfolio.entity';
import { DeviceToken } from './device-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ default: '' })
  avatarUrl: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  jobTitle: string;

  @Column({ type: 'text', default: '' })
  bio: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  city: string;

  @Column({ default: '' })
  state: string;

  @Column({ default: '' })
  zipCode: string;

  @Column({ default: '' })
  unit: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  password: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @Exclude()
  googleId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @Exclude()
  githubId: string | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  twoFactorSecret: string | null;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  pushNotifications: boolean;

  @Column({ default: false })
  smsNotifications: boolean;

  @Column({ default: true })
  marketingNotifications: boolean;

  @Column({ default: true })
  artifactDeploymentNotifications: boolean;

  @Column({ default: true })
  mentionNotifications: boolean;

  @Column({ default: true })
  milestoneNotifications: boolean;

  @Column({ default: true })
  allocationNotifications: boolean;

  @Column({ default: true })
  ledgerNotifications: boolean;

  @Column({ default: true })
  transactionNotifications: boolean;

  @Column({ default: true })
  loginAlertNotifications: boolean;

  @Column({ default: true })
  securityAlertNotifications: boolean;

  @Column({ default: true })
  kernelUpdateNotifications: boolean;

  @Column({ default: 'Viewer' })
  role: string; // 'SuperAdmin' | 'Admin' | 'Editor' | 'Support' | 'Viewer'

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ default: 'Starter' })
  subscriptionPlan: string; // 'Starter' | 'Pro' | 'Business'

  @Column({ default: 'active' })
  subscriptionStatus: string; // 'active' | 'past_due' | 'canceled'

  @Column({ default: false })
  isAI: boolean;

  @Column({ default: 0 })
  tokenVersion: number; // Incremented to invalidate all tokens

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Ticket, (ticket) => ticket.customer)
  tickets: Ticket[];

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethods: PaymentMethod[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => DownloadRecord, (downloadRecord) => downloadRecord.user)
  downloadRecords: DownloadRecord[];

  @OneToMany(() => UserAsset, (userAsset) => userAsset.user)
  userAssets: UserAsset[];

  @OneToMany(() => Quote, (quote) => quote.user)
  quotes: Quote[];

  @OneToMany(() => ApiKey, (apiKey) => apiKey.createdBy)
  apiKeys: ApiKey[];

  @OneToMany(() => BlockedUser, (blockedUser) => blockedUser.blockedBy)
  blockedUsers: BlockedUser[];

  @OneToMany(() => EmailVerificationToken, (token) => token.user)
  emailVerificationTokens: EmailVerificationToken[];

  @OneToMany(() => Product, (product) => product.vendor)
  products: Product[];

  @OneToMany(() => Portfolio, (portfolio) => portfolio.user)
  portfolios: Portfolio[];

  @OneToMany(() => DeviceToken, (deviceToken) => deviceToken.user)
  deviceTokens: DeviceToken[];

  @Column({ type: 'timestamp', nullable: true })
  deletionRequestedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
