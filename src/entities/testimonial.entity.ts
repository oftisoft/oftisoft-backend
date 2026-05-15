import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  company: string;

  @Column('text')
  quote: string;

  @Column({ nullable: true })
  avatar: string;

  @Column('int', { default: 5 })
  rating: number;

  @Column({ nullable: true })
  gradient: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('int', { default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
