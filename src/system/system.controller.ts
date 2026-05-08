import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { SystemConfig } from '../entities/system-config.entity';
import { ApiKey } from '../entities/api-key.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { User } from '../entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../entities/audit-log.entity';

@Controller('system')
export class SystemController {
  constructor(
    private systemService: SystemService,
    private auditService: AuditService,
  ) {}

  @Get('public/config')
  @Public()
  async getPublicConfig(): Promise<{
    stripePublishableKey?: string;
    paypalClientId?: string;
    shopName: string;
    currency: string;
  }> {
    const config = await this.systemService.getConfig();
    return {
      stripePublishableKey: config.stripePublishableKey || undefined,
      paypalClientId: config.paypalClientId || undefined,
      shopName: config.shopName || 'Oftisoft',
      currency: config.currency || 'USD',
    };
  }

  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async getConfig(): Promise<SystemConfig> {
    return this.systemService.getConfig();
  }

  @Post('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async updateConfig(
    @Body() data: Partial<SystemConfig>,
    @Req() req: any,
  ): Promise<SystemConfig> {
    const oldConfig = await this.systemService.getConfig();
    const updated = await this.systemService.updateConfig(data);

    // Audit log
    await this.auditService.log(
      req.user.id,
      req.user.email,
      req.user.role,
      AuditAction.SETTINGS_CHANGED,
      'system_config',
      String(updated.id),
      oldConfig,
      data,
      'Updated system configuration',
      req,
    );

    return updated;
  }

  // Staff
  @Get('staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async getAllStaff(): Promise<User[]> {
    return this.systemService.getAllStaff();
  }

  @Patch('staff/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async updateStaffRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @Req() req: any,
  ): Promise<User> {
    const user = await this.systemService.getUserById(id);
    const oldRole = user.role;
    const updated = await this.systemService.updateStaffRole(id, role);

    // Audit log
    await this.auditService.log(
      req.user.id,
      req.user.email,
      req.user.role,
      AuditAction.USER_ROLE_CHANGED,
      'user',
      id,
      { role: oldRole },
      { role },
      `Changed user role from ${oldRole} to ${role}`,
      req,
    );

    return updated;
  }

  @Delete('staff/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async removeStaff(@Param('id') id: string, @Req() req: any): Promise<void> {
    const user = await this.systemService.getUserById(id);
    await this.systemService.removeStaff(id);

    // Audit log
    await this.auditService.log(
      req.user.id,
      req.user.email,
      req.user.role,
      AuditAction.USER_DELETED,
      'user',
      id,
      { name: user.name, email: user.email, role: user.role },
      null,
      `Removed staff member: ${user.email}`,
      req,
    );
  }

  // API Keys
  @Get('api-keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async getApiKeys(): Promise<ApiKey[]> {
    return this.systemService.getApiKeys();
  }

  @Post('api-keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async createApiKey(
    @Body('name') name: string,
    @Req() req: any,
  ): Promise<ApiKey> {
    const apiKey = await this.systemService.createApiKey(name, req.user.id);

    // Audit log
    await this.auditService.log(
      req.user.id,
      req.user.email,
      req.user.role,
      AuditAction.API_KEY_GENERATED,
      'api_key',
      apiKey.id,
      null,
      { name: apiKey.name },
      `Generated new API key: ${name}`,
      req,
    );

    return apiKey;
  }

  @Patch('api-keys/:id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async revokeApiKey(@Param('id') id: string, @Req() req: any): Promise<void> {
    const apiKey = await this.systemService.getApiKeyById(id);
    await this.systemService.revokeApiKey(id);

    // Audit log
    await this.auditService.log(
      req.user.id,
      req.user.email,
      req.user.role,
      AuditAction.API_KEY_REVOKED,
      'api_key',
      id,
      { name: apiKey.name, isActive: true },
      { isActive: false },
      `Revoked API key: ${apiKey.name}`,
      req,
    );
  }

  // Email Templates
  @Get('email-templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return this.systemService.getEmailTemplates();
  }

  @Post('email-templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async createEmailTemplate(
    @Body() data: Partial<EmailTemplate>,
    @Req() req: any,
  ): Promise<EmailTemplate> {
    const template = await this.systemService.createEmailTemplate(data);

    // Audit log
    await this.auditService.log(
      req.user.id,
      req.user.email,
      req.user.role,
      AuditAction.SETTINGS_CHANGED,
      'email_template',
      template.id,
      null,
      { name: template.name },
      `Created email template: ${template.name}`,
      req,
    );

    return template;
  }

  @Patch('email-templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async updateEmailTemplate(
    @Param('id') id: string,
    @Body() data: Partial<EmailTemplate>,
    @Req() req: any,
  ): Promise<EmailTemplate> {
    const oldTemplate = await this.systemService.getEmailTemplateById(id);
    const updated = await this.systemService.updateEmailTemplate(id, data);

    // Audit log
    await this.auditService.log(
      req.user.id,
      req.user.email,
      req.user.role,
      AuditAction.SETTINGS_CHANGED,
      'email_template',
      id,
      { name: oldTemplate.name, subject: oldTemplate.subject },
      { name: updated.name, subject: updated.subject },
      `Updated email template: ${oldTemplate.name}`,
      req,
    );

    return updated;
  }

  @Delete('email-templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  async deleteEmailTemplate(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    const template = await this.systemService.getEmailTemplateById(id);
    await this.systemService.deleteEmailTemplate(id);

    // Audit log
    await this.auditService.log(
      req.user.id,
      req.user.email,
      req.user.role,
      AuditAction.SETTINGS_CHANGED,
      'email_template',
      id,
      { name: template.name },
      null,
      `Deleted email template: ${template.name}`,
      req,
    );
  }
}
