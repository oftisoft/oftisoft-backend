import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('blocked_users')
export class BlockedUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blockerId: string;

  @Column()
  blockedId: string;

  @ManyToOne(() => User, (user) => user.blockedUsers)
  @JoinColumn({ name: 'blockerId' })
  blockedBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blockedId' })
  blockedUser: User;

  @CreateDateColumn()
  blockedAt: Date;

  @Column({ nullable: true })
  reason: string;
}
