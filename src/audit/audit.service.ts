import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import type { Request } from 'express';

export interface AuditStats {
  totalActions: number;
  byAction: Record<AuditAction, number>;
  byUser: Record<string, number>;
  byDay: Record<string, number>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string,
    userEmail: string,
    userRole: string,
    action: AuditAction,
    targetType: string,
    targetId?: string,
    oldValue?: unknown,
    newValue?: unknown,
    description?: string,
    req?: Request,
  ): Promise<AuditLog> {
    const audit = this.auditRepository.create({
      userId,
      userEmail,
      userRole,
      action,
      targetType,
      targetId,
      oldValue,
      newValue,
      description,
      ipAddress: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers?.['user-agent'],
    });

    return this.auditRepository.save(audit);
  }

  async findByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByTarget(
    targetType: string,
    targetId: string,
  ): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { targetType, targetId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAction(
    action: AuditAction,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findRecent(limit: number = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStats(days: number = 30): Promise<AuditStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditRepository
      .createQueryBuilder('audit')
      .where('audit.createdAt >= :startDate', { startDate })
      .getMany();

    const stats: AuditStats = {
      totalActions: logs.length,
      byAction: {} as Record<AuditAction, number>,
      byUser: {},
      byDay: {},
    };

    logs.forEach((log) => {
      const action = log.action;
      stats.byAction[action] = (stats.byAction[action] || 0) + 1;
      stats.byUser[log.userEmail] = (stats.byUser[log.userEmail] || 0) + 1;
      const day = log.createdAt.toISOString().split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    return stats;
  }
}
