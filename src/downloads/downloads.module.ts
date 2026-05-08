import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';
import { Product } from '../entities/product.entity';
import { UserAsset } from '../entities/user-asset.entity';
import { DownloadRecord } from '../entities/download-record.entity';
import { UpdateNotification } from '../entities/update-notification.entity';
import { User } from '../entities/user.entity';
import { ProductVersion } from '../entities/product-version.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      UserAsset,
      DownloadRecord,
      UpdateNotification,
      User,
      ProductVersion,
    ]),
  ],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
