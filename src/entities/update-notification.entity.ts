import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('update_notifications')
export class UpdateNotification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    product: Product;

    @Column()
    oldVersion: string;

    @Column()
    newVersion: string;

    @Column()
    importance: string; // 'major' | 'minor' | 'security'

    @CreateDateColumn()
    date: Date;
}
