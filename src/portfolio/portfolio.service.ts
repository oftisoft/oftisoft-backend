import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
  ) {}

  async create(
    createPortfolioDto: CreatePortfolioDto,
    userId?: string,
  ): Promise<Portfolio> {
    const portfolio = this.portfolioRepository.create({
      ...createPortfolioDto,
      userId,
    });
    return this.portfolioRepository.save(portfolio);
  }

  async findAll(status?: string): Promise<Portfolio[]> {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    return this.portfolioRepository.find({
      where,
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({ where: { id } });

    if (!portfolio) {
      throw new NotFoundException('Portfolio item not found');
    }

    return portfolio;
  }

  async findBySlug(slug: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { slug },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio item not found');
    }

    return portfolio;
  }

  async update(
    id: string,
    updatePortfolioDto: UpdatePortfolioDto,
  ): Promise<Portfolio> {
    const portfolio = await this.findOne(id);
    Object.assign(portfolio, updatePortfolioDto);
    return this.portfolioRepository.save(portfolio);
  }

  async remove(id: string): Promise<void> {
    const portfolio = await this.findOne(id);
    await this.portfolioRepository.remove(portfolio);
  }
}
