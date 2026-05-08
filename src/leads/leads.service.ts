import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadType, LeadStatus } from '../entities/lead.entity';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) {}

  async createLead(data: Partial<Lead>) {
    const lead = this.leadRepository.create(data);
    return this.leadRepository.save(lead);
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
