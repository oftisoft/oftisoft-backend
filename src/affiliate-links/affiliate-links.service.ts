import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AffiliateLink, AffiliateLinkStatus } from '../entities/affiliate-link.entity';

@Injectable()
export class AffiliateLinksService {
  constructor(
    @InjectRepository(AffiliateLink)
    private repo: Repository<AffiliateLink>,
  ) {}

  async findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async findActive() {
    return this.repo.find({
      where: { status: AffiliateLinkStatus.ACTIVE },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByCategory(category: string) {
    return this.repo.find({
      where: { status: AffiliateLinkStatus.ACTIVE, category },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string) {
    const link = await this.repo.findOne({ where: { id } });
    if (!link) throw new NotFoundException('Affiliate link not found');
    return link;
  }

  async create(data: Partial<AffiliateLink>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<AffiliateLink>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const link = await this.findOne(id);
    return this.repo.remove(link);
  }

  async trackClick(id: string) {
    await this.repo.increment({ id }, 'clicks', 1);
    return { success: true };
  }

  async trackConversion(id: string, amount: number) {
    await this.repo.increment({ id }, 'conversions', 1);
    await this.repo.increment({ id }, 'earnings', amount);
    return { success: true };
  }

  async getStats() {
    const total = await this.repo.count();
    const active = await this.repo.count({ where: { status: AffiliateLinkStatus.ACTIVE } });
    const totalClicks = (await this.repo.find()).reduce((s, l) => s + l.clicks, 0);
    const totalEarnings = (await this.repo.find()).reduce((s, l) => s + l.earnings, 0);
    return { total, active, totalClicks, totalEarnings };
  }
}
