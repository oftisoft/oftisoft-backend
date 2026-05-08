import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    return this.reviewsService.findAll(req.user.id);
  }

  @Get('moderation')
  @UseGuards(JwtAuthGuard)
  getForModeration(@Req() req) {
    return this.reviewsService.findAllPendingForModeration(
      req.user.id,
      req.user.role,
    );
  }

  @Get(':productId')
  getByProduct(@Param('productId') productId: string) {
    return this.reviewsService.getByProduct(productId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req,
  ) {
    return this.reviewsService.update(
      id,
      updateReviewDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.reviewsService.remove(id, req.user.id, req.user.role);
  }
}
