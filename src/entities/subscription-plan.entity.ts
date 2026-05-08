import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column({ default: 'month' })
  interval: string; // 'month' | 'year'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  features: string[];

  @Column({ nullable: true })
  buttonText: string;

  @Column({ default: 0 })
  activeSubscribers: number;

  @Column({ nullable: true })
  iconName: string; // e.g., 'Zap', 'Sparkles', 'TrendingUp'

  @Column({ default: 'text-blue-500' })
  color: string;

  @Column({ default: 'bg-blue-500/10' })
  bgColor: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
