
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: false })
    read: boolean;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn()
    sender: User;

    @ManyToOne(() => Conversation, conversation => conversation.messages)
    conversation: Conversation;
}
