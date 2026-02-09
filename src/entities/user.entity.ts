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
  role: string; // 'Admin' | 'Editor' | 'Support' | 'Viewer'

  @Column({ default: 'Starter' })
  subscriptionPlan: string; // 'Starter' | 'Pro' | 'Business'

  @Column({ default: 'active' })
  subscriptionStatus: string; // 'active' | 'past_due' | 'canceled'

  @Column({ default: false })
  isAI: boolean;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
