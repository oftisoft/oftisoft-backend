import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum AffiliateTier {
  STANDARD = 'standard',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum AffiliateStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  BANNED = 'banned',
}

@Entity('affiliates')
export class Affiliate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  @Index()
  referralCode: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 0 })
  totalWithdrawn: number;

  @Column({
    type: 'enum',
    enum: AffiliateTier,
    default: AffiliateTier.STANDARD,
  })
  tier: AffiliateTier;

  @Column({
    type: 'enum',
    enum: AffiliateStatus,
    default: AffiliateStatus.ACTIVE,
  })
  status: AffiliateStatus;

  @Column('decimal', { precision: 5, scale: 2, default: 10 })
  commissionRate: number;

  @Column({ default: 0 })
  totalReferrals: number;

  @Column({ default: 0 })
  totalConversions: number;

  @Column({ default: 0 })
  totalClicks: number;

  @Column({ default: 0 })
  pendingCommissions: number;

  @Column({ default: 0 })
  clearedCommissions: number;

  @Column({ default: 0 })
  cancelledCommissions: number;

  @Column({ nullable: true })
  lastActivityAt: Date;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
