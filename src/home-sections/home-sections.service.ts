import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeSection } from '../entities/home-section.entity';
import { CreateHomeSectionDto } from './dto/create-home-section.dto';
import { UpdateHomeSectionDto } from './dto/update-home-section.dto';

@Injectable()
export class HomeSectionsService {
  constructor(
    @InjectRepository(HomeSection)
    private readonly homeSectionRepo: Repository<HomeSection>,
  ) {}

  async findAll(): Promise<HomeSection[]> {
    return this.homeSectionRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async findActive(): Promise<HomeSection[]> {
    return this.homeSectionRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByKey(sectionKey: string): Promise<HomeSection> {
    const section = await this.homeSectionRepo.findOne({ where: { sectionKey } });
    if (!section) throw new NotFoundException(`Section '${sectionKey}' not found`);
    return section;
  }

  async create(dto: CreateHomeSectionDto): Promise<HomeSection> {
    const section = this.homeSectionRepo.create(dto);
    return this.homeSectionRepo.save(section);
  }

  async update(id: string, dto: UpdateHomeSectionDto): Promise<HomeSection> {
    const section = await this.homeSectionRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');
    Object.assign(section, dto);
    return this.homeSectionRepo.save(section);
  }

  async remove(id: string): Promise<void> {
    const result = await this.homeSectionRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Section not found');
  }
}
