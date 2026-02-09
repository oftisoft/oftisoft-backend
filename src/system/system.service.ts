import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../entities/system-config.entity';
import { ApiKey } from '../entities/api-key.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SeederService } from './seeder.service';

@Injectable()
export class SystemService implements OnModuleInit {
    constructor(
        @InjectRepository(SystemConfig)
        private configRepository: Repository<SystemConfig>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ApiKey)
        private apiKeyRepository: Repository<ApiKey>,
        @InjectRepository(EmailTemplate)
        private emailTemplateRepository: Repository<EmailTemplate>,
        private seederService: SeederService,
    ) { }

    async onModuleInit() {
        const count = await this.configRepository.count();
        if (count === 0) {
            await this.configRepository.save(this.configRepository.create({}));
        }

        // Run architectural data seed
        await this.seederService.seed();
    }

    async getConfig(): Promise<SystemConfig> {
        const config = await this.configRepository.findOne({ where: {} });
        if (!config) return this.configRepository.save(this.configRepository.create({}));
        return config;
    }

    async updateConfig(data: Partial<SystemConfig>): Promise<SystemConfig> {
        const config = await this.getConfig();
        Object.assign(config, data);
        return this.configRepository.save(config);
    }

    // Staff
    async getAllStaff(): Promise<User[]> {
        return this.userRepository.find({ order: { createdAt: 'DESC' } });
    }

    async updateStaffRole(userId: string, role: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error('User not found');
        user.role = role;
        return this.userRepository.save(user);
    }

    async removeStaff(userId: string): Promise<void> {
        await this.userRepository.delete(userId);
    }

    // API Keys
    async getApiKeys(): Promise<ApiKey[]> {
        return this.apiKeyRepository.find({ order: { createdAt: 'DESC' } });
    }

    async createApiKey(name: string, userId: string): Promise<ApiKey> {
        const key = `ofti_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
        const apiKey = this.apiKeyRepository.create({
            name,
            key,
            createdBy: { id: userId } as User
        });
        return this.apiKeyRepository.save(apiKey);
    }

    async revokeApiKey(id: string): Promise<void> {
        await this.apiKeyRepository.update(id, { status: 'revoked' });
    }

    // Email Templates
    async getEmailTemplates(): Promise<EmailTemplate[]> {
        return this.emailTemplateRepository.find({ order: { updatedAt: 'DESC' } });
    }

    async createEmailTemplate(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const template = this.emailTemplateRepository.create(data);
        return this.emailTemplateRepository.save(template);
    }

    async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        await this.emailTemplateRepository.update(id, data);
        const template = await this.emailTemplateRepository.findOne({ where: { id } });
        if (!template) throw new Error('Template not found');
        return template;
    }

    async deleteEmailTemplate(id: string): Promise<void> {
        await this.emailTemplateRepository.delete(id);
    }
}
