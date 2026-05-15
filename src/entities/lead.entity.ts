import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LeadType {
  CTA = 'cta',
  NEWSLETTER = 'newsletter',
  CONTACT = 'contact',
  PARTNER = 'partner',
}

export enum LeadStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  CONVERTED = 'converted',
  ARCHIVED = 'archived',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  email: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: LeadType,
    default: LeadType.CTA,
  })
  type: LeadType;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  partnerType: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
