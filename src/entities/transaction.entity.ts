import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceId: string; // e.g., "L-2026-X1"

  @Column()
  amount: string; // e.g., "$1,240.00"

  @Column()
  type: string; // e.g., "Service Settlement", "Pro Subscription"

  @Column()
  status: string; // e.g., "completed", "pending"

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  dueAt: Date;
}
