import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from '../entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
        const product = await this.productRepository.findOne({ where: { id: createReviewDto.productId } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const review = this.reviewRepository.create({
            ...createReviewDto,
            product,
            user: { id: userId } as User,
            status: ReviewStatus.PENDING
        });

        // Update product rating
        await this.updateProductRating(product.id, review.rating);

        return this.reviewRepository.save(review);
    }

    async findAll(userId: string): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { user: { id: userId } },
            relations: ['product', 'user'],
            order: { createdAt: 'DESC' }
        });
    }

    async getByProduct(productId: string): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { product: { id: productId }, status: ReviewStatus.APPROVED },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: string): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['product', 'user']
        });

        if (!review) {
            throw new NotFoundException(`Review #${id} not found`);
        }

        return review;
    }

    async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
        const review = await this.findOne(id);
        Object.assign(review, updateReviewDto);
        return this.reviewRepository.save(review);
    }

    async remove(id: string): Promise<void> {
        const review = await this.findOne(id);
        await this.reviewRepository.remove(review);
    }

    private async updateProductRating(productId: string, newRating: number) {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: []
        });

        if (product) {
            const allReviews = await this.reviewRepository.find({ where: { product: { id: productId } } });
            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0) + newRating;
            const count = allReviews.length + 1;

            product.rating = parseFloat((totalRating / count).toFixed(1));
            product.reviews = count;
            await this.productRepository.save(product);
        }
    }
}
