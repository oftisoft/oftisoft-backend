import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('affiliates')
export class Affiliate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column({ unique: true })
    referralCode: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalEarnings: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    balance: number;

    @Column({ default: 'standard' })
    tier: string; // 'standard', 'gold', 'platinum'

    @Column('decimal', { precision: 5, scale: 2, default: 20 })
    commissionRate: number;

    @CreateDateColumn()
    createdAt: Date;
}
