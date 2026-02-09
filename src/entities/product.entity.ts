import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column('text')
    description: string;

    @Column('decimal')
    price: number;

    @Column('decimal', { precision: 3, scale: 1, default: 0 })
    rating: number;

    @Column({ default: 0 })
    reviews: number;

    @Column()
    category: string;

    @Column()
    subcategory: string;

    @Column()
    image: string;

    @Column('simple-array')
    tags: string[];

    @Column('simple-array')
    features: string[];

    @Column('simple-array', { nullable: true })
    screenshots: string[];

    @Column({ nullable: true })
    demoUrl: string;

    @Column({ nullable: true })
    docUrl: string;

    @Column('simple-array', { nullable: true })
    compatibility: string[];

    @Column()
    version: string;

    @Column()
    updatePolicy: string;

    @Column('decimal')
    licenseRegular: number;

    @Column('decimal')
    licenseExtended: number;

    @Column({ type: 'timestamp', nullable: true })
    lastUpdated: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
