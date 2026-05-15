import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogSeederService } from './blog-seeder.service';
import { BlogSeederController } from './blog-seeder.controller';

@Module({
  imports: [],
  controllers: [BlogSeederController],
  providers: [BlogSeederService],
  exports: [BlogSeederService],
})
export class BlogSeederModule {}
