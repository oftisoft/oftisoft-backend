import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad, AdPosition } from '../entities/ad.entity';

@Injectable()
export class AdsService {
    constructor(
        @InjectRepository(Ad)
        private adsRepository: Repository<Ad>,
    ) { }

    async findAll() {
        return this.adsRepository.find({
            order: { createdAt: 'DESC' }
        });
    }

    async findActiveByPosition(position: AdPosition) {
        return this.adsRepository.find({
            where: { position, isActive: true },
            order: { updatedAt: 'DESC' }
        });
    }

    async findOne(id: string) {
        return this.adsRepository.findOne({ where: { id } });
    }

    async create(adData: Partial<Ad>) {
        const ad = this.adsRepository.create(adData);
        return this.adsRepository.save(ad);
    }

    async update(id: string, adData: Partial<Ad>) {
        await this.adsRepository.update(id, adData);
        return this.findOne(id);
    }

    async remove(id: string) {
        await this.adsRepository.delete(id);
        return { deleted: true };
    }

    async trackImpression(id: string) {
        await this.adsRepository.increment({ id }, 'views', 1);
    }

    async trackClick(id: string) {
        await this.adsRepository.increment({ id }, 'clicks', 1);
    }
}
