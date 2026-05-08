import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_ROLE_CHANGED = 'user.role_changed',
  USER_BANNED = 'user.banned',
  USER_UNBANNED = 'user.unbanned',
  USER_IMPERSONATED = 'user.impersonated',

  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  PRODUCT_APPROVED = 'product.approved',
  PRODUCT_REJECTED = 'product.rejected',

  SETTINGS_CHANGED = 'settings.changed',
  API_KEY_GENERATED = 'api_key.generated',
  API_KEY_REVOKED = 'api_key.revoked',

  LOGIN_SUCCESS = 'login.success',
  LOGIN_FAILED = 'login.failed',
  LOGOUT = 'logout',

  PASSWORD_CHANGED = 'password.changed',
  EMAIL_VERIFIED = 'email.verified',

  BULK_OPERATION = 'bulk.operation',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['targetType', 'targetId'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userEmail: string;

  @Column()
  userRole: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column()
  targetType: string; // 'user', 'product', 'settings', etc.

  @Column({ nullable: true })
  targetId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: any;

  @Column({ type: 'jsonb', nullable: true })
  newValue: any;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
