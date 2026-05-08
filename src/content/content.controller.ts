import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { UpdatePageContentDto } from './dto/update-page-content.dto';
import { AiGenerateDto } from './dto/ai-generate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('ai-generate')
  @UseGuards(JwtAuthGuard)
  async aiGenerate(@Body() dto: AiGenerateDto) {
    return this.contentService.generateWithAI({
      prompt: dto.prompt,
      fieldType: dto.fieldType,
      pageKey: dto.pageKey,
      sectionId: dto.sectionId,
      fieldName: dto.fieldName,
      context: dto.context,
    });
  }

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

  // Navbar content endpoints
  @Get('navbar')
  getNavbarContent() {
    return this.contentService.getPageContent('navbar');
  }

  @Put('navbar')
  @UseGuards(JwtAuthGuard)
  updateNavbarContent(@Body() updateDto: UpdatePageContentDto) {
    return this.contentService.updatePageContent('navbar', updateDto);
  }

  @Post('navbar/publish')
  @UseGuards(JwtAuthGuard)
  publishNavbarContent() {
    return this.contentService.publishPageContent('navbar');
  }

  // Footer content endpoints
  @Get('footer')
  getFooterContent() {
    return this.contentService.getPageContent('footer');
  }

  @Put('footer')
  @UseGuards(JwtAuthGuard)
  updateFooterContent(@Body() updateDto: UpdatePageContentDto) {
    return this.contentService.updatePageContent('footer', updateDto);
  }

  @Post('footer/publish')
  @UseGuards(JwtAuthGuard)
  publishFooterContent() {
    return this.contentService.publishPageContent('footer');
  }

  @Get(':pageKey')
  getPageContent(@Param('pageKey') pageKey: string) {
    return this.contentService.getPageContent(pageKey);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.s3Service.uploadImage(file, 'content');
    return { url: result.url, key: result.key };
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
