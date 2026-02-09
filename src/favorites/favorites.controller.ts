import { Controller, Get, Post, Delete, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    @Get()
    async getFavorites(@GetUser() user: User) {
        const favorites = await this.favoritesService.findAll(user);
        return favorites.map(f => ({
            ...f.product,
            addedAt: f.addedAt
        }));
    }

    @Post(':productId')
    async addFavorite(
        @GetUser() user: User,
        @Param('productId') productId: string
    ) {
        return this.favoritesService.add(user, productId);
    }

    @Delete(':productId')
    async removeFavorite(
        @GetUser() user: User,
        @Param('productId') productId: string
    ) {
        return this.favoritesService.remove(user, productId);
    }

    @Get(':productId/check')
    async checkFavorite(
        @GetUser() user: User,
        @Param('productId') productId: string
    ) {
        return this.favoritesService.check(user, productId);
    }
}
