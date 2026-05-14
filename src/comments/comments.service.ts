import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async findByPost(postId: string): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { postId, status: CommentStatus.APPROVED },
      relations: ['user', 'parent'],
      order: { createdAt: 'DESC' },
    });
    return comments;
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find({
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const result = await this.commentRepository.update(id, { status: status as CommentStatus });
    if (result.affected === 0) throw new NotFoundException('Comment not found');
  }

  async create(dto: CreateCommentDto, userId: string): Promise<Comment> {
    if (dto.parentId) {
      const parent = await this.commentRepository.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentRepository.create({
      content: dto.content,
      postId: dto.postId,
      userId,
      parentId: dto.parentId || undefined,
      status: CommentStatus.APPROVED,
    } as any);

    const saved = await this.commentRepository.save(comment) as unknown as Comment;

    await this.postRepository.increment({ id: dto.postId }, 'comments', 1);

    return saved;
  }

  async like(id: string): Promise<void> {
    const result = await this.commentRepository.increment({ id }, 'likes', 1);
    if (result.affected === 0) throw new NotFoundException('Comment not found');
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new NotFoundException('Not authorized');
    await this.commentRepository.remove(comment);
  }
}
