import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Oftisoft Universe' })
  shopName: string;

  @Column({ default: 'support@oftisoft.com' })
  supportEmail: string;

  @Column({
    type: 'text',
    default:
      'Premium digital assets and custom development services for modern high-fidelity businesses.',
  })
  description: string;

  @Column({ default: 'USD ($)' })
  currency: string;

  @Column({ default: 'UTC (GMT+0)' })
  timezone: string;

  @Column({ default: 'YYYY-MM-DD' })
  dateFormat: string;

  @Column({ default: false })
  maintenanceMode: boolean;

  @Column({ default: 'medium' })
  passwordPolicy: 'low' | 'medium' | 'high'; // low: 6 chars, medium: 8 chars + num, high: 10 chars + num + special

  @Column({ type: 'text', default: '' })
  allowedIps: string; // Comma separated list of IPs for admin access

  // Payment Gateway Configuration
  @Column({ nullable: true })
  stripePublishableKey: string;

  @Column({ nullable: true })
  stripeSecretKey: string;

  @Column({ nullable: true })
  paypalClientId: string;

  @Column({ nullable: true })
  paypalClientSecret: string;

  @Column({ default: false })
  financeSandboxMode: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
