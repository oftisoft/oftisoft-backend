import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('user_assets')
export class UserAsset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    product: Product;

    @Column()
    licenseKey: string;

    @Column({ default: 'Regular' })
    licenseType: string;

    @Column({ nullable: true })
    bonusAsset: string;

    @CreateDateColumn()
    purchaseDate: Date;
}
