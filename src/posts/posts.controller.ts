import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PostStatus } from '../entities/post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Public endpoints
  @Get()
  async findAll(
    @Query('status') status?: PostStatus,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.postsService.findAll({
      status,
      type,
      categoryId,
      tag,
      search,
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
    });

    return result;
  }

  @Get('featured')
  async getFeatured() {
    return this.postsService.getFeatured();
  }

  @Get('tags')
  async getTags() {
    return this.postsService.getTags();
  }

  @Get('categories')
  async getCategories() {
    return this.postsService.getCategories();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async getStats() {
    return this.postsService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);
    // Increment view count for public reads
    await this.postsService.incrementViews(id);
    return post;
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const post = await this.postsService.findBySlug(slug);
    await this.postsService.incrementViews(post.id);
    return post;
  }

  @Get(':id/related')
  async getRelated(@Param('id') id: string) {
    return this.postsService.getRelated(id);
  }

  // Protected endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async create(@Body() body: any, @Request() req: any) {
    const { tags, ...postData } = body;
    return this.postsService.create(
      {
        ...postData,
        authorId: req.user.id,
      },
      tags,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async update(@Param('id') id: string, @Body() body: any) {
    const { tags, ...postData } = body;
    return this.postsService.update(id, postData, tags);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin')
  async remove(@Param('id') id: string) {
    await this.postsService.remove(id);
    return { message: 'Post deleted' };
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async publish(@Param('id') id: string, @Request() req: any) {
    return this.postsService.publish(id, req.user.id);
  }

  @Put(':id/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async schedule(
    @Param('id') id: string,
    @Body('scheduledAt') scheduledAt: string,
  ) {
    return this.postsService.schedule(id, new Date(scheduledAt));
  }

  @Put(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin')
  async archive(@Param('id') id: string) {
    return this.postsService.archive(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async like(@Param('id') id: string) {
    await this.postsService.incrementLikes(id);
    return { message: 'Liked' };
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async duplicate(@Param('id') id: string, @Request() req: any) {
    return this.postsService.duplicate(id, req.user.id);
  }

  @Put(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async unpublish(@Param('id') id: string) {
    return this.postsService.unpublish(id);
  }

  @Put(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin')
  async restore(@Param('id') id: string) {
    return this.postsService.restore(id);
  }
}
