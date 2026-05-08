import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  @Column()
  last4: string;

  @Column()
  expiry: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column()
  type: string; // e.g., "Digital Gold", "Business Elite"

  @ManyToOne(() => User, (user) => user.paymentMethods, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
