import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  category: string;

  @Column()
  client: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  longDescription: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'simple-array', nullable: true })
  screenshots: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  gradient: string;

  @Column({ type: 'text', nullable: true })
  stats: string;

  @Column({ default: false })
  featured: boolean;

  @Column({
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.portfolios, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
