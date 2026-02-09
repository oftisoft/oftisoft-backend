import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('quotes')
export class Quote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    serviceType: string;

    @Column('text')
    description: string;

    @Column()
    budget: string;

    @Column({
        type: 'enum',
        enum: ['requested', 'responded', 'accepted', 'rejected'],
        default: 'requested'
    })
    status: string;

    @Column('json', { nullable: true })
    proposal: {
        price: number;
        estimatedDays: number;
        validUntil: string;
        content: string;
        milestones: Array<{
            id: string;
            title: string;
            week: number;
            status: string;
        }>;
    };

    @Column({ nullable: true })
    userId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
