import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: 'direct' })
  type: string; // 'direct', 'group'

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ type: 'simple-json', nullable: true })
  blockedBy: string[];

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
