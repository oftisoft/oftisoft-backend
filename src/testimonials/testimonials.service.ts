import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from '../entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private testimonialRepository: Repository<Testimonial>,
  ) {}

  async create(createTestimonialDto: CreateTestimonialDto): Promise<Testimonial> {
    const testimonial = this.testimonialRepository.create(createTestimonialDto);
    return this.testimonialRepository.save(testimonial);
  }

  async findAll(): Promise<Testimonial[]> {
    return this.testimonialRepository.find({ order: { order: 'ASC', createdAt: 'DESC' } });
  }

  async findActive(): Promise<Testimonial[]> {
    return this.testimonialRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({ where: { id } });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial #${id} not found`);
    }
    return testimonial;
  }

  async update(id: string, updateTestimonialDto: UpdateTestimonialDto): Promise<Testimonial> {
    const testimonial = await this.findOne(id);
    Object.assign(testimonial, updateTestimonialDto);
    return this.testimonialRepository.save(testimonial);
  }

  async remove(id: string): Promise<void> {
    const testimonial = await this.findOne(id);
    await this.testimonialRepository.remove(testimonial);
  }
}
