import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private favoriteRepository: Repository<Favorite>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async findAll(user: User) {
        return this.favoriteRepository.find({
            where: { user: { id: user.id } },
            relations: ['product'],
            order: { addedAt: 'DESC' },
        });
    }

    async add(user: User, productId: string) {
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const existing = await this.favoriteRepository.findOne({
            where: { user: { id: user.id }, product: { id: productId } },
        });

        if (existing) {
            throw new ConflictException('Product already in favorites');
        }

        const favorite = this.favoriteRepository.create({
            user,
            product,
        });

        await this.favoriteRepository.save(favorite);
        return { message: 'Added to favorites' };
    }

    async remove(user: User, productId: string) {
        const favorite = await this.favoriteRepository.findOne({
            where: { user: { id: user.id }, product: { id: productId } },
        });

        if (!favorite) {
            throw new NotFoundException('Favorite not found');
        }

        await this.favoriteRepository.remove(favorite);
        return { message: 'Removed from favorites' };
    }

    async check(user: User, productId: string) {
        const favorite = await this.favoriteRepository.findOne({
            where: { user: { id: user.id }, product: { id: productId } },
        });
        return { isFavorite: !!favorite };
    }
}
