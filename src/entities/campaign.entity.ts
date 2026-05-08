import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

export enum CampaignType {
  EMAIL = 'email',
  SOCIAL = 'social',
  PPC = 'ppc',
  CONTENT = 'content',
  AFFILIATE = 'affiliate',
  REFERRAL = 'referral',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.EMAIL,
  })
  type: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  spent: number;

  @Column('json', { nullable: true })
  targetAudience: {
    demographics?: string[];
    locations?: string[];
    interests?: string[];
    ageRange?: { min: number; max: number };
  };

  @Column('json', { nullable: true })
  channels: {
    type: string;
    config: Record<string, any>;
  }[];

  @Column('json', { nullable: true })
  content: {
    subject?: string;
    headline?: string;
    body?: string;
    cta?: string;
    ctaUrl?: string;
    images?: string[];
  };

  @Column('json', { nullable: true })
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    costPerClick: number;
    costPerAcquisition: number;
    returnOnAdSpend: number;
  };

  @Column({ default: false })
  isRecurring: boolean;

  @Column('json', { nullable: true })
  recurrence: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };

  @Column('simple-array', { nullable: true })
  tags: string[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ nullable: true })
  createdBy: string;

  @Column('text', { nullable: true })
  seoTitle: string;

  @Column('text', { nullable: true })
  seoDescription: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
