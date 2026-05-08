import { Controller, Post, Logger } from '@nestjs/common';
import { BlogSeederService } from './blog-seeder.service';

@Controller('seeder')
export class BlogSeederController {
  private readonly logger = new Logger(BlogSeederController.name);

  constructor(private readonly blogSeederService: BlogSeederService) {}

  @Post('blog')
  async seedBlogPosts() {
    this.logger.log('Starting blog posts seeding...');
    try {
      await this.blogSeederService.seedBlogPosts();
      return {
        success: true,
        message: 'Blog posts seeded successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to seed blog posts', error.stack);
      return {
        success: false,
        message: 'Failed to seed blog posts',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('blog/reset')
  async resetBlogPosts() {
    this.logger.log('Resetting blog posts...');
    try {
      await this.blogSeederService.resetBlogPosts();
      return {
        success: true,
        message: 'Blog posts reset successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to reset blog posts', error.stack);
      return {
        success: false,
        message: 'Failed to reset blog posts',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
