import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AffiliateLinkStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  INACTIVE = 'inactive',
}

@Entity('affiliate_links')
export class AffiliateLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  programName: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  badgeText: string;

  @Column({ default: 0 })
  commissionRate: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: AffiliateLinkStatus, default: AffiliateLinkStatus.ACTIVE })
  status: AffiliateLinkStatus;

  @Column({ default: 0 })
  clicks: number;

  @Column({ default: 0 })
  conversions: number;

  @Column({ default: 0 })
  earnings: number;

  @Column({ default: 'tools' })
  category: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
