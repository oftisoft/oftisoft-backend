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

export enum EventType {
  WEBINAR = 'webinar',
  WORKSHOP = 'workshop',
  CONFERENCE = 'conference',
  MEETUP = 'meetup',
  HACKATHON = 'hackathon',
  TRAINING = 'training',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  shortDescription: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.WEBINAR,
  })
  type: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  location: string; // Physical location or "Online"

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  onlinePlatform: string; // Zoom, Google Meet, etc.

  @Column({ nullable: true })
  meetingUrl: string;

  @Column()
  capacity: number;

  @Column({ default: 0 })
  registeredCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: true })
  isFree: boolean;

  @Column({ nullable: true })
  image: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('json', { nullable: true })
  agenda: {
    time: string;
    title: string;
    description: string;
    speaker?: string;
  }[];

  @Column('json', { nullable: true })
  speakers: {
    id: string;
    name: string;
    bio: string;
    avatar: string;
    role: string;
    company: string;
  }[];

  @Column('json', { nullable: true })
  sponsors: {
    id: string;
    name: string;
    logo: string;
    tier: string;
  }[];

  @Column({ nullable: true })
  registrationDeadline: Date;

  @Column({ default: true })
  requiresApproval: boolean;

  @Column({ nullable: true })
  certificateTemplate: string;

  @Column('text', { nullable: true })
  seoTitle: string;

  @Column('text', { nullable: true })
  seoDescription: string;

  @Column('simple-array', { nullable: true })
  seoKeywords: string[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
