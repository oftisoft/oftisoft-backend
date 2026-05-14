import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('posts/:postId/comments')
  async findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Get('comments')
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.commentsService.findAll();
  }

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('postId') postId: string,
    @Body() body: { content: string; parentId?: string },
    @Request() req: any,
  ) {
    return this.commentsService.create({
      content: body.content,
      postId,
      parentId: body.parentId,
    }, req.user.id);
  }

  @Post('comments/:id/like')
  @UseGuards(JwtAuthGuard)
  async like(@Param('id') id: string) {
    await this.commentsService.like(id);
    return { message: 'Liked' };
  }

  @Patch('comments/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    await this.commentsService.updateStatus(id, body.status);
    return { message: 'Status updated' };
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.commentsService.remove(id, req.user.id);
    return { message: 'Comment deleted' };
  }
}
