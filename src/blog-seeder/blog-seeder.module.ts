import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogSeederService } from './blog-seeder.service';
import { BlogSeederController } from './blog-seeder.controller';
import { PageContent } from '../entities/page-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PageContent])],
  controllers: [BlogSeederController],
  providers: [BlogSeederService],
  exports: [BlogSeederService],
})
export class BlogSeederModule {}
