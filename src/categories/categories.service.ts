import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = this.categoriesRepository.create(createCategoryDto);
        return this.categoriesRepository.save(category);
    }

    async findAll(): Promise<Category[]> {
        return this.categoriesRepository.find({
            order: { order: 'ASC', name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Category> {
        const category = await this.categoriesRepository.findOne({ where: { id } });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);
        Object.assign(category, updateCategoryDto);
        return this.categoriesRepository.save(category);
    }

    async remove(id: string): Promise<void> {
        const category = await this.findOne(id);
        await this.categoriesRepository.remove(category);
    }

    async addSubcategory(id: string, subcategory: string): Promise<Category> {
        const category = await this.findOne(id);
        if (!category.subcategories.includes(subcategory)) {
            category.subcategories.push(subcategory);
            return this.categoriesRepository.save(category);
        }
        return category;
    }

    async removeSubcategory(id: string, subcategory: string): Promise<Category> {
        const category = await this.findOne(id);
        category.subcategories = category.subcategories.filter(s => s !== subcategory);
        return this.categoriesRepository.save(category);
    }

    async updateProductCount(id: string, count: number): Promise<Category> {
        const category = await this.findOne(id);
        category.productCount = count;
        return this.categoriesRepository.save(category);
    }
}
