import { Controller, Get, Post, Body, UseGuards, Param, Delete, Patch, Req } from '@nestjs/common';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SystemConfig } from '../entities/system-config.entity';
import { ApiKey } from '../entities/api-key.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { User } from '../entities/user.entity';

@Controller('system')
@UseGuards(JwtAuthGuard)
export class SystemController {
    constructor(private systemService: SystemService) { }

    @Get('config')
    async getConfig(): Promise<SystemConfig> {
        return this.systemService.getConfig();
    }

    @Post('config')
    async updateConfig(@Body() data: Partial<SystemConfig>): Promise<SystemConfig> {
        return this.systemService.updateConfig(data);
    }

    // Staff
    @Get('staff')
    async getAllStaff(): Promise<User[]> {
        return this.systemService.getAllStaff();
    }

    @Patch('staff/:id/role')
    async updateStaffRole(@Param('id') id: string, @Body('role') role: string): Promise<User> {
        return this.systemService.updateStaffRole(id, role);
    }

    @Delete('staff/:id')
    async removeStaff(@Param('id') id: string): Promise<void> {
        return this.systemService.removeStaff(id);
    }

    // API Keys
    @Get('api-keys')
    async getApiKeys(): Promise<ApiKey[]> {
        return this.systemService.getApiKeys();
    }

    @Post('api-keys')
    async createApiKey(@Body('name') name: string, @Req() req: any): Promise<ApiKey> {
        return this.systemService.createApiKey(name, req.user.id);
    }

    @Patch('api-keys/:id/revoke')
    async revokeApiKey(@Param('id') id: string): Promise<void> {
        return this.systemService.revokeApiKey(id);
    }

    // Email Templates
    @Get('email-templates')
    async getEmailTemplates(): Promise<EmailTemplate[]> {
        return this.systemService.getEmailTemplates();
    }

    @Post('email-templates')
    async createEmailTemplate(@Body() data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        return this.systemService.createEmailTemplate(data);
    }

    @Patch('email-templates/:id')
    async updateEmailTemplate(@Param('id') id: string, @Body() data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        return this.systemService.updateEmailTemplate(id, data);
    }

    @Delete('email-templates/:id')
    async deleteEmailTemplate(@Param('id') id: string): Promise<void> {
        return this.systemService.deleteEmailTemplate(id);
    }
}
