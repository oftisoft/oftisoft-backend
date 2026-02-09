import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Affiliate } from './affiliate.entity';
import { Order } from './order.entity';

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

    @Column({ default: 'pending' })
    status: string; // 'pending', 'cleared', 'cancelled'

    @CreateDateColumn()
    createdAt: Date;
}
