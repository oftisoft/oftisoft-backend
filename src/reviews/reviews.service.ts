import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from '../entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

const MODERATOR_ROLES = ['Admin', 'Editor'];

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  private isModerator(role: string): boolean {
    return MODERATOR_ROLES.includes(role);
  }

  async create(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      product,
      user: { id: userId } as User,
      status: ReviewStatus.PENDING,
    });

    const saved = await this.reviewRepository.save(review);
    // Product rating only updates when review is approved
    return saved;
  }

  async findAll(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPendingForModeration(
    userId: string,
    role: string,
  ): Promise<Review[]> {
    if (!this.isModerator(role)) {
      return this.reviewRepository.find({
        where: { user: { id: userId }, status: ReviewStatus.PENDING },
        relations: ['product', 'user'],
        order: { createdAt: 'DESC' },
      });
    }
    return this.reviewRepository.find({
      where: { status: ReviewStatus.PENDING },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getByProduct(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { product: { id: productId }, status: ReviewStatus.APPROVED },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });

    if (!review) {
      throw new NotFoundException(`Review #${id} not found`);
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
    role: string,
  ): Promise<Review> {
    const review = await this.findOne(id);
    const isOwner = review.user?.id === userId;
    const isMod = this.isModerator(role);

    if (updateReviewDto.status !== undefined) {
      if (!isMod) {
        throw new ForbiddenException(
          'Only Admin or Editor can approve or reject reviews',
        );
      }
    } else if (!isOwner && !isMod) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    const saved = await this.reviewRepository.save(review);
    if (
      updateReviewDto.status === ReviewStatus.APPROVED ||
      updateReviewDto.status === ReviewStatus.REJECTED
    ) {
      await this.recalculateProductRating(review.product.id);
    }
    return saved;
  }

  async remove(id: string, userId: string, role: string): Promise<void> {
    const review = await this.findOne(id);
    const isOwner = review.user?.id === userId;
    const isMod = this.isModerator(role);
    if (!isOwner && !isMod) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    await this.reviewRepository.remove(review);
  }

  private async recalculateProductRating(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: [],
    });
    if (!product) return;

    const approvedReviews = await this.reviewRepository.find({
      where: { product: { id: productId }, status: ReviewStatus.APPROVED },
    });
    const count = approvedReviews.length;
    if (count === 0) {
      product.rating = 0;
      product.reviews = 0;
    } else {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = parseFloat((totalRating / count).toFixed(1));
      product.reviews = count;
    }
    await this.productRepository.save(product);
  }
}
