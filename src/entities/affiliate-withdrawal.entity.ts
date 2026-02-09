import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Affiliate } from './affiliate.entity';

@Entity('affiliate_withdrawals')
export class AffiliateWithdrawal {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Affiliate, { onDelete: 'CASCADE' })
    affiliate: Affiliate;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    method: string; // 'paypal', 'stripe', 'bank'

    @Column({ default: 'pending' })
    status: string; // 'pending', 'processing', 'completed', 'failed'

    @CreateDateColumn()
    createdAt: Date;
}
