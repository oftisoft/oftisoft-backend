import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    client: string;

    @Column({
        type: 'enum',
        enum: ['Planning', 'In Progress', 'Review', 'Completed', 'Delayed', 'On Hold'],
        default: 'Planning'
    })
    status: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    progress: number;

    @Column({ nullable: true })
    dueDate: Date;

    @Column({ type: 'int', default: 1 })
    members: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    budget: number;

    @Column({
        type: 'enum',
        enum: ['Paid', 'Unpaid', 'Pending', 'Partial'],
        default: 'Unpaid'
    })
    paymentStatus: string;

    @Column({ nullable: true })
    userId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
