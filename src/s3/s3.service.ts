import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get('AWS_BUCKET') || 'oftisoft';

    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION') || 'auto',
      endpoint: this.configService.get('AWS_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      } as any,
      forcePathStyle:
        this.configService.get('AWS_USE_PATH_STYLE_ENDPOINT') === 'true',
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = this.getPublicUrl(key);

    return { url, key };
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'avatars',
  ): Promise<{ url: string; key: string }> {
    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    return this.uploadFile(file, folder);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getSignedUrl(key: string, expiration: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: expiration });
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  getPublicUrl(key: string): string {
    const endpoint = this.configService.get('AWS_ENDPOINT');
    return `${endpoint}/${this.bucket}/${key}`;
  }

  async listFiles(folder: string = 'uploads'): Promise<{ name: string; url: string; key: string; size: number; lastModified: Date }[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: folder.endsWith('/') ? folder : `${folder}/`,
    });

    const response = await this.s3Client.send(command);

    return (response.Contents || []).map((item) => ({
      name: item.Key?.split('/').pop() || '',
      key: item.Key || '',
      url: this.getPublicUrl(item.Key || ''),
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  }
}
