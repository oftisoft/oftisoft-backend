import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuditService } from './audit.service';
import { AuditAction } from '../entities/audit-log.entity';
import { User } from '../entities/user.entity';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  @Roles('Admin', 'SuperAdmin')
  async getLogs(
    @Query('limit') limit: string,
    @Query('action') action?: string,
  ) {
    const take = parseInt(limit) || 50;

    if (action && Object.values(AuditAction).includes(action as AuditAction)) {
      return this.auditService.findByAction(action as AuditAction, take);
    }

    return this.auditService.findRecent(take);
  }

  @Get('stats')
  @Roles('Admin', 'SuperAdmin')
  async getStats(@Query('days') days: string) {
    const daysNum = parseInt(days) || 30;
    return this.auditService.getStats(daysNum);
  }

  @Get('my-activity')
  async getMyActivity(@GetUser() user: User, @Query('limit') limit: string) {
    const take = parseInt(limit) || 50;
    return this.auditService.findByUser(user.id, take);
  }
}
