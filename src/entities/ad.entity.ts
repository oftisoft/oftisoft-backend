import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AdType {
    IMAGE = 'image',
    GOOGLE_ADS = 'google-ads',
    CUSTOM_HTML = 'custom-html',
    SCRIPT = 'script'
}

export enum AdPosition {
    BLOG_LIST_TOP = 'blog-list-top',
    BLOG_LIST_MIDDLE = 'blog-list-middle',
    BLOG_SIDEBAR = 'blog-sidebar',
    POST_CONTENT_TOP = 'post-content-top',
    POST_CONTENT_BOTTOM = 'post-content-bottom',
    FOOTER_ABOVE = 'footer-above'
}

export enum AdSize {
    LEADERBOARD = '728x90',
    BANNER = '468x60',
    SQUARE = '250x250',
    RECTANGLE = '300x250',
    SKY_SCRAPER = '120x600',
    AUTO = 'responsive'
}

@Entity('ads')
export class Ad {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({
        type: 'enum',
        enum: AdType,
        default: AdType.IMAGE
    })
    type: AdType;

    @Column('text')
    content: string; // Image URL, Google Ad Script, or HTML

    @Column({ nullable: true })
    link: string; // Target URL for image ads

    @Column({
        type: 'enum',
        enum: AdPosition,
        default: AdPosition.BLOG_SIDEBAR
    })
    position: AdPosition;

    @Column({
        type: 'enum',
        enum: AdSize,
        default: AdSize.AUTO
    })
    size: AdSize;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    clicks: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
