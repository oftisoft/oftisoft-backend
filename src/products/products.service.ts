import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productsRepository.create(createProductDto);
        return this.productsRepository.save(product);
    }

    async findAll(search?: string, category?: string): Promise<Product[]> {
        const where: any = {};

        if (search) {
            where.name = Like(`%${search}%`);
        }

        if (category && category !== 'all') {
            where.category = category;
        }

        return this.productsRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productsRepository.findOne({ where: { id } });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return this.productsRepository.save(product);
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);
        await this.productsRepository.remove(product);
    }

    async getStats(): Promise<any> {
        const total = await this.productsRepository.count();
        const categories = await this.productsRepository
            .createQueryBuilder('product')
            .select('product.category')
            .distinct(true)
            .getRawMany();

        return {
            totalProducts: total,
            activeCategories: categories.length,
            stockWarnings: 3, // Mock for now
            totalSales: 12490, // Mock for now
        };
    }
}
