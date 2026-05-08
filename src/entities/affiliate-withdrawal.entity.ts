import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Affiliate } from './affiliate.entity';

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum WithdrawalMethod {
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
  PAYONEER = 'payoneer',
  WISE = 'wise',
}

@Entity('affiliate_withdrawals')
export class AffiliateWithdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Affiliate, { onDelete: 'CASCADE' })
  affiliate: Affiliate;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  fee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  netAmount: number;

  @Column({
    type: 'enum',
    enum: WithdrawalMethod,
  })
  method: WithdrawalMethod;

  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  @Index()
  status: WithdrawalStatus;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  processedBy: string;

  @Column({ nullable: true })
  rejectedAt: Date;

  @Column({ nullable: true })
  rejectedBy: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ nullable: true })
  transactionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
