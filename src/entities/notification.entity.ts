
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string; // 'alert' | 'project' | 'team' | 'billing' | 'system'

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column({ default: false })
    read: boolean;

    @Column({ default: false })
    archived: boolean;

    @Column({ default: 'normal' })
    priority: string; // 'high' | 'normal' | 'low'

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
}
