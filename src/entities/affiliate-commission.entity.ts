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
import { Order } from './order.entity';

export enum CommissionStatus {
  PENDING = 'pending',
  CLEARED = 'cleared',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
}

export enum CommissionType {
  SALE = 'sale',
  RECURRING = 'recurring',
  BONUS = 'bonus',
  MANUAL = 'manual',
}

@Entity('affiliate_commissions')
export class AffiliateCommission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Affiliate, { onDelete: 'CASCADE' })
  affiliate: Affiliate;

  @ManyToOne(() => Order)
  order: Order;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  orderTotal: number;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  @Index()
  status: CommissionStatus;

  @Column({
    type: 'enum',
    enum: CommissionType,
    default: CommissionType.SALE,
  })
  type: CommissionType;

  @Column({ nullable: true })
  clearedAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  processedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
