import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@GetUser() user: User) {
    const favorites = await this.favoritesService.findAll(user);
    return favorites.map((f) => {
      const p = f.product as any;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        rating: Number(p.rating ?? 0),
        reviews: Number(p.reviews ?? 0),
        category: p.category,
        subcategory: p.subcategory,
        image: p.image,
        tags: Array.isArray(p.tags)
          ? p.tags
          : typeof p.tags === 'string'
            ? p.tags
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean)
            : [],
        features: Array.isArray(p.features) ? p.features : [],
        version: p.version,
        updatePolicy: p.updatePolicy,
        addedAt: f.addedAt,
      };
    });
  }

  @Post(':productId')
  async addFavorite(
    @GetUser() user: User,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.add(user, productId);
  }

  @Delete(':productId')
  async removeFavorite(
    @GetUser() user: User,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.remove(user, productId);
  }

  @Get(':productId/check')
  async checkFavorite(
    @GetUser() user: User,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.check(user, productId);
  }
}
