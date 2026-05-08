import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post, PostStatus } from '../entities/post.entity';
import { Tag } from '../entities/tag.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(postData: Partial<Post>, tagNames?: string[]): Promise<Post> {
    // Handle tags
    let tags: Tag[] = [];
    if (tagNames && tagNames.length > 0) {
      tags = await this.getOrCreateTags(tagNames);
    }

    const post = this.postRepository.create({
      ...postData,
      tags,
    });

    // Calculate read time (average 200 words per minute)
    if (postData.content) {
      const wordCount = postData.content.split(/\s+/).length;
      post.readTime = Math.ceil(wordCount / 200);
    }

    return this.postRepository.save(post);
  }

  async findAll(options?: {
    status?: PostStatus;
    type?: string;
    categoryId?: string;
    authorId?: string;
    tag?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: Post[]; total: number }> {
    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags');

    if (options?.status) {
      query.andWhere('post.status = :status', { status: options.status });
    }

    if (options?.type) {
      query.andWhere('post.type = :type', { type: options.type });
    }

    if (options?.categoryId) {
      query.andWhere('post.categoryId = :categoryId', {
        categoryId: options.categoryId,
      });
    }

    if (options?.authorId) {
      query.andWhere('post.authorId = :authorId', {
        authorId: options.authorId,
      });
    }

    if (options?.tag) {
      query.andWhere('tags.slug = :tagSlug', { tagSlug: options.tag });
    }

    if (options?.search) {
      query.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search OR post.excerpt ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    const total = await query.getCount();

    query.orderBy('post.createdAt', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const posts = await query.getMany();
    return { posts, total };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ['author', 'category', 'tags'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(
    id: string,
    postData: Partial<Post>,
    tagNames?: string[],
  ): Promise<Post> {
    const post = await this.findOne(id);

    // Handle tags
    if (tagNames) {
      post.tags = await this.getOrCreateTags(tagNames);
    }

    Object.assign(post, postData);

    // Recalculate read time if content changed
    if (postData.content) {
      const wordCount = postData.content.split(/\s+/).length;
      post.readTime = Math.ceil(wordCount / 200);
    }

    return this.postRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }

  async publish(id: string, approverId: string): Promise<Post> {
    const post = await this.findOne(id);
    post.status = PostStatus.PUBLISHED;
    post.publishedAt = new Date();
    post.approvedBy = approverId;
    post.approvedAt = new Date();
    return this.postRepository.save(post);
  }

  async schedule(id: string, scheduledAt: Date): Promise<Post> {
    const post = await this.findOne(id);
    post.status = PostStatus.SCHEDULED;
    post.scheduledAt = scheduledAt;
    return this.postRepository.save(post);
  }

  async archive(id: string): Promise<Post> {
    const post = await this.findOne(id);
    post.status = PostStatus.ARCHIVED;
    return this.postRepository.save(post);
  }

  async incrementViews(id: string): Promise<void> {
    await this.postRepository.increment({ id }, 'views', 1);
  }

  async incrementLikes(id: string): Promise<void> {
    await this.postRepository.increment({ id }, 'likes', 1);
  }

  async getFeatured(): Promise<Post[]> {
    return this.postRepository.find({
      where: { status: PostStatus.PUBLISHED, isFeatured: true },
      relations: ['author', 'category', 'tags'],
      order: { publishedAt: 'DESC' },
      take: 5,
    });
  }

  async getRelated(postId: string, limit = 5): Promise<Post[]> {
    const post = await this.findOne(postId);

    if (!post.categoryId && (!post.tags || post.tags.length === 0)) {
      return [];
    }

    const tagIds = post.tags?.map((t) => t.id) || [];

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.id != :id', { id: postId })
      .andWhere('post.status = :status', { status: PostStatus.PUBLISHED });

    if (post.categoryId) {
      query.andWhere('post.categoryId = :categoryId', {
        categoryId: post.categoryId,
      });
    }

    if (tagIds.length > 0) {
      query.andWhere('tags.id IN (:...tagIds)', { tagIds });
    }

    query.orderBy('post.publishedAt', 'DESC').limit(limit);

    return query.getMany();
  }

  async getTags(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    totalViews: number;
    totalLikes: number;
  }> {
    const total = await this.postRepository.count();
    const published = await this.postRepository.count({
      where: { status: PostStatus.PUBLISHED },
    });
    const draft = await this.postRepository.count({
      where: { status: PostStatus.DRAFT },
    });

    const viewsResult = await this.postRepository
      .createQueryBuilder('post')
      .select('SUM(post.views)', 'totalViews')
      .getRawOne();

    const likesResult = await this.postRepository
      .createQueryBuilder('post')
      .select('SUM(post.likes)', 'totalLikes')
      .getRawOne();

    return {
      total,
      published,
      draft,
      totalViews: Number(viewsResult?.totalViews || 0),
      totalLikes: Number(likesResult?.totalLikes || 0),
    };
  }

  private async getOrCreateTags(tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];

    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      let tag = await this.tagRepository.findOne({ where: { slug } });

      if (!tag) {
        tag = this.tagRepository.create({
          name,
          slug,
        });
        await this.tagRepository.save(tag);
      }

      tags.push(tag);
    }

    return tags;
  }
}
