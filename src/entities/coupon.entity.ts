import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('coupons')
export class Coupon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    })
    discountType: 'percentage' | 'fixed';

    @Column('decimal')
    discountValue: number;

    @Column({ type: 'timestamp' })
    expiryDate: Date;

    @Column({ default: 0 })
    usageCount: number;

    @Column({ nullable: true })
    usageLimit: number;

    @Column({
        type: 'enum',
        enum: ['active', 'expired', 'disabled'],
        default: 'active'
    })
    status: 'active' | 'expired' | 'disabled';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
