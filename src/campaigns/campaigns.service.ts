import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus, CampaignType } from '../entities/campaign.entity';
import { EmailService } from '../auth/email.service';
import { LeadService } from '../leads/leads.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    private emailService: EmailService,
    private leadService: LeadService,
  ) {}

  async create(campaignData: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaignRepository.create(campaignData);
    return this.campaignRepository.save(campaign);
  }

  async findAll(options?: {
    status?: CampaignStatus;
    type?: string;
  }): Promise<Campaign[]> {
    const query = this.campaignRepository.createQueryBuilder('campaign');

    if (options?.status) {
      query.andWhere('campaign.status = :status', { status: options.status });
    }

    if (options?.type) {
      query.andWhere('campaign.type = :type', { type: options.type });
    }

    query.orderBy('campaign.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async findBySlug(slug: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { slug },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async update(id: string, campaignData: Partial<Campaign>): Promise<Campaign> {
    const campaign = await this.findOne(id);
    Object.assign(campaign, campaignData);
    return this.campaignRepository.save(campaign);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignRepository.remove(campaign);
  }

  async updateMetrics(
    id: string,
    metrics: Partial<Campaign['metrics']>,
  ): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.metrics = {
      ...campaign.metrics,
      ...metrics,
    } as any;
    return this.campaignRepository.save(campaign);
  }

  async updateSpent(id: string, amount: number): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.spent = Number(campaign.spent) + amount;
    return this.campaignRepository.save(campaign);
  }

  async start(id: string): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.status = CampaignStatus.ACTIVE;
    return this.campaignRepository.save(campaign);
  }

  async pause(id: string): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.status = CampaignStatus.PAUSED;
    return this.campaignRepository.save(campaign);
  }

  async complete(id: string): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.status = CampaignStatus.COMPLETED;
    campaign.endDate = new Date();
    return this.campaignRepository.save(campaign);
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return this.campaignRepository.find({
      where: { status: CampaignStatus.ACTIVE },
    });
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    totalBudget: number;
    totalSpent: number;
    avgROAS: number;
  }> {
    const campaigns = await this.campaignRepository.find();

    return {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === CampaignStatus.ACTIVE)
        .length,
      completed: campaigns.filter((c) => c.status === CampaignStatus.COMPLETED)
        .length,
      totalBudget: campaigns.reduce((sum, c) => sum + Number(c.budget), 0),
      totalSpent: campaigns.reduce((sum, c) => sum + Number(c.spent), 0),
      avgROAS: this.calculateAvgROAS(campaigns),
    };
  }

  async sendCampaignEmails(campaignId: string): Promise<{ sent: number; failed: number }> {
    const campaign = await this.findOne(campaignId);
    const leads = await this.leadService.findAll();

    let sent = 0;
    let failed = 0;

    for (const lead of leads) {
      try {
        const subject = campaign.content?.subject || campaign.name;
        const body = campaign.content?.body || '';
        await this.emailService.sendCustomEmail(lead.email, subject, body);
        sent++;
      } catch {
        failed++;
      }
    }

    await this.updateMetrics(campaignId, {
      impressions: (campaign.metrics?.impressions || 0) + sent,
    });

    return { sent, failed };
  }

  async scheduleCampaign(campaignId: string, scheduledDate: Date): Promise<Campaign> {
    const campaign = await this.findOne(campaignId);
    campaign.status = CampaignStatus.SCHEDULED;
    campaign.startDate = scheduledDate;
    return this.campaignRepository.save(campaign);
  }

  async executeCampaign(campaignId: string): Promise<Campaign> {
    const campaign = await this.findOne(campaignId);

    if (
      campaign.status !== CampaignStatus.SCHEDULED &&
      campaign.status !== CampaignStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'Campaign must be in SCHEDULED or ACTIVE status to execute',
      );
    }

    campaign.status = CampaignStatus.ACTIVE;

    switch (campaign.type) {
      case CampaignType.EMAIL: {
        const result = await this.sendCampaignEmails(campaignId);
        campaign.metrics = {
          ...campaign.metrics,
          impressions: (campaign.metrics?.impressions || 0) + result.sent,
        } as any;
        break;
      }
      case CampaignType.SOCIAL:
        campaign.metrics = {
          ...campaign.metrics,
          impressions: (campaign.metrics?.impressions || 0) + 100,
        } as any;
        break;
      case CampaignType.PPC:
      case CampaignType.CONTENT:
      case CampaignType.AFFILIATE:
      case CampaignType.REFERRAL:
        break;
    }

    return this.campaignRepository.save(campaign);
  }

  async sendTestEmail(
    campaignId: string,
    testEmail: string,
  ): Promise<{ message: string }> {
    const campaign = await this.findOne(campaignId);

    const subject = campaign.content?.subject || campaign.name;
    const body = campaign.content?.body || '';

    await this.emailService.sendCustomEmail(
      testEmail,
      `[TEST] ${subject}`,
      body,
    );

    return { message: `Test email sent to ${testEmail}` };
  }

  private calculateAvgROAS(campaigns: Campaign[]): number {
    const withRevenue = campaigns.filter(
      (c) => c.metrics?.revenue && Number(c.spent) > 0,
    );
    if (withRevenue.length === 0) return 0;

    const totalROAS = withRevenue.reduce((sum, c) => {
      const roas = Number(c.metrics.revenue) / Number(c.spent);
      return sum + roas;
    }, 0);

    return totalROAS / withRevenue.length;
  }
}
