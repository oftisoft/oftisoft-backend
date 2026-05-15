import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { S3Service } from '../s3/s3.service';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private s3Service: S3Service) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.s3Service.uploadImage(file, 'uploads');
      return { url: result.url, key: result.key };
    } catch (error) {
      this.logger.error('Upload failed', error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }
}
