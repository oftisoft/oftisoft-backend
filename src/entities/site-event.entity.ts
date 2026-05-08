import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('site_events')
export class SiteEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventType: string; // e.g., 'click', 'form_submit', 'signup'

  @Column({ nullable: true })
  eventLabel: string; // e.g., 'Buy Now Button'

  @Column({ nullable: true })
  page: string;

  @Column({ nullable: true })
  metadata: string; // JSON string for extra data

  @CreateDateColumn()
  timestamp: Date;
}
