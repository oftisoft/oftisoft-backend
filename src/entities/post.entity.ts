import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled',
}

export enum PostType {
  ARTICLE = 'article',
  TUTORIAL = 'tutorial',
  CASE_STUDY = 'case_study',
  NEWS = 'news',
  ANNOUNCEMENT = 'announcement',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  excerpt: string;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.ARTICLE,
  })
  type: PostType;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ nullable: true })
  featuredImageAlt: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'postId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @Column('simple-array', { nullable: true })
  keywords: string[];

  @Column({ default: 0 })
  readTime: number; // in minutes

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  comments: number;

  @Column({ default: true })
  allowComments: boolean;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column('text', { nullable: true })
  seoTitle: string;

  @Column('text', { nullable: true })
  seoDescription: string;

  @Column('text', { nullable: true })
  canonicalUrl: string;

  @Column({ default: true })
  isIndexed: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isPinned: boolean;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver: User;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
