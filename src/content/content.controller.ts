import { Controller, Get, Post, Put, Param, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ContentService } from './content.service';
import { UpdatePageContentDto } from './dto/update-page-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('content')
export class ContentController {
    constructor(
        private readonly contentService: ContentService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Get('files')
    @UseGuards(JwtAuthGuard)
    getAllFiles() {
        return this.contentService.getAllFiles();
    }

    @Get('pages')
    @UseGuards(JwtAuthGuard)
    getAllPages() {
        return this.contentService.getAllPages();
    }

    @Get(':pageKey')
    getPageContent(@Param('pageKey') pageKey: string) {
        return this.contentService.getPageContent(pageKey);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file')) // Uses memory storage by default
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const result = await this.cloudinaryService.uploadImage(file, 'oftisoft/content');
        return { url: result.secure_url };
    }

    @Put(':pageKey')
    @UseGuards(JwtAuthGuard)
    updatePageContent(
        @Param('pageKey') pageKey: string,
        @Body() updateDto: UpdatePageContentDto,
    ) {
        return this.contentService.updatePageContent(pageKey, updateDto);
    }

    @Put(':pageKey/publish')
    @UseGuards(JwtAuthGuard)
    publishPageContent(@Param('pageKey') pageKey: string) {
        return this.contentService.publishPageContent(pageKey);
    }
}
