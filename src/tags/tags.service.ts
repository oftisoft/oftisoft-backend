import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(dto: CreateTagDto): Promise<Tag> {
    const slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-');
    const tag = this.tagsRepository.create({ ...dto, slug });
    return this.tagsRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    if (dto.name && !dto.slug) {
      tag.slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    }
    return this.tagsRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagsRepository.remove(tag);
  }
}
