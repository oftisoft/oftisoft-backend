import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(user: User) {
    return this.favoriteRepository.find({
      where: { user: { id: user.id } },
      relations: ['product'],
      order: { addedAt: 'DESC' },
    });
  }

  async add(user: User, productId: string) {
    if (!isValidUuid(productId)) {
      throw new BadRequestException(
        'Invalid product id. Only products from the catalog can be added to favorites.',
      );
    }
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
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
    if (!isValidUuid(productId)) {
      throw new BadRequestException('Invalid product id.');
    }
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
    if (!isValidUuid(productId)) {
      return { isFavorite: false };
    }
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: user.id }, product: { id: productId } },
    });
    return { isFavorite: !!favorite };
  }
}
