import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PageContent } from '../entities/page-content.entity';
import { MulterModule } from '@nestjs/platform-express';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PageContent]),
    MulterModule.register({
      dest: './uploads',
    }),
    S3Module,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
