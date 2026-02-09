import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PageContent } from '../entities/page-content.entity';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';


@Module({
    imports: [
        TypeOrmModule.forFeature([PageContent]),
        MulterModule.register({
            dest: './uploads',
        }),
        CloudinaryModule,
    ],
    controllers: [ContentController],
    providers: [ContentService],
    exports: [ContentService],
})
export class ContentModule { }
