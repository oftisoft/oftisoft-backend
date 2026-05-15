import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadType, LeadStatus } from '../entities/lead.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { PartnerApplicationDto } from './dto/partner-application.dto';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async createLead(data: Partial<Lead>) {
    const lead = this.leadRepository.create(data);
    return this.leadRepository.save(lead);
  }

  async subscribe(dto: SubscribeDto) {
    const existing = await this.leadRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('This email is already subscribed');
    }
    const lead = this.leadRepository.create({
      email: dto.email,
      type: LeadType.NEWSLETTER,
      status: LeadStatus.NEW,
    });
    return this.leadRepository.save(lead);
  }

  async createPartnerApplication(dto: PartnerApplicationDto) {
    const lead = this.leadRepository.create({
      companyName: dto.companyName,
      email: dto.email,
      website: dto.website,
      partnerType: dto.partnerType,
      message: dto.message,
      type: LeadType.PARTNER,
      status: LeadStatus.NEW,
    });
    const saved = await this.leadRepository.save(lead);

    const admins = await this.usersRepository.find({
      where: [
        { role: 'Admin' },
        { role: 'SuperAdmin' },
      ],
    });
    for (const admin of admins) {
      this.notificationsService
        .create(admin.id, {
          type: 'partner',
          title: 'New Partner Application',
          description: `${dto.companyName} (${dto.email}) applied as ${dto.partnerType}`,
          link: `/admin/leads/${saved.id}`,
        })
        .catch(() => {});
    }

    return {
      success: true,
      message: 'Partner application submitted successfully',
    };
  }

  async findAll() {
    return this.leadRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateStatus(id: string, status: LeadStatus) {
    await this.leadRepository.update(id, { status });
    return this.findOne(id);
  }

  async deleteLead(id: string) {
    const lead = await this.findOne(id);
    return this.leadRepository.remove(lead);
  }

  async getStats() {
    const total = await this.leadRepository.count();
    const newLeads = await this.leadRepository.count({
      where: { status: LeadStatus.NEW },
    });
    const ctaCount = await this.leadRepository.count({
      where: { type: LeadType.CTA },
    });
    const newsletterCount = await this.leadRepository.count({
      where: { type: LeadType.NEWSLETTER },
    });

    return {
      total,
      newLeads,
      ctaCount,
      newsletterCount,
    };
  }
}
