import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_versions')
export class ProductVersion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    product: Product;

    @Column()
    version: string;

    @Column('text')
    changelog: string;

    @Column({ nullable: true })
    downloadUrl: string;

    @CreateDateColumn()
    releaseDate: Date;
}
