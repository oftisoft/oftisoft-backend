import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from '../entities/integration.entity';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {}

  async getIntegrations(): Promise<Integration[]> {
    // Return all integrations or create defaults if none exist
    let integrations = await this.integrationRepository.find();

    if (integrations.length === 0) {
      // Create default integrations
      const defaults = [
        {
          id: 'github',
          name: 'GitHub',
          category: 'Development',
          connected: false,
        },
        {
          id: 'slack',
          name: 'Slack',
          category: 'Communication',
          connected: false,
        },
        { id: 'aws', name: 'AWS', category: 'Storage', connected: false },
        { id: 'jira', name: 'Jira', category: 'Management', connected: false },
        {
          id: 'gmail',
          name: 'Gmail',
          category: 'Communication',
          connected: false,
        },
      ];

      integrations = this.integrationRepository.create(defaults);
      await this.integrationRepository.save(integrations);
    }

    return integrations;
  }

  async toggleIntegration(
    id: string,
    connected: boolean,
  ): Promise<Integration> {
    let integration = await this.integrationRepository.findOne({
      where: { id },
    });

    if (!integration) {
      // Create if doesn't exist
      integration = this.integrationRepository.create({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        connected,
      });
    } else {
      integration.connected = connected;
    }

    return this.integrationRepository.save(integration);
  }
}
