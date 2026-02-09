import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('page_content')
export class PageContent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    pageKey: string; // 'terms', 'privacy', 'about', etc.

    @Column('jsonb')
    content: any; // Flexible JSON structure for different page types

    @Column({ default: 'draft' })
    status: string; // 'draft' | 'published'

    @Column({ nullable: true })
    publishedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
