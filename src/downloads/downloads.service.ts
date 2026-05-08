import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { UserAsset } from '../entities/user-asset.entity';
import { DownloadRecord } from '../entities/download-record.entity';
import { UpdateNotification } from '../entities/update-notification.entity';
import { User } from '../entities/user.entity';
import { ProductVersion } from '../entities/product-version.entity';

@Injectable()
export class DownloadsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(UserAsset)
    private userAssetRepository: Repository<UserAsset>,
    @InjectRepository(DownloadRecord)
    private downloadRecordRepository: Repository<DownloadRecord>,
    @InjectRepository(UpdateNotification)
    private notificationRepository: Repository<UpdateNotification>,
    @InjectRepository(ProductVersion)
    private versionRepository: Repository<ProductVersion>,
  ) {}

  async getInventory(user: User) {
    const assets = await this.userAssetRepository.find({
      where: { user: { id: user.id } },
      relations: ['product'],
      order: { purchaseDate: 'DESC' },
    });

    return assets.map((asset) => ({
      id: asset.id,
      name: asset.product.name,
      image: asset.product.image,
      version: asset.product.version,
      date: asset.purchaseDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      license: asset.licenseKey,
      type: `${asset.licenseType} License`,
      compatibility: (asset.product.compatibility || []).join(', '),
      docUrl: asset.product.docUrl,
      demoUrl: asset.product.demoUrl,
      bonusAsset: asset.bonusAsset || 'No bonus assets included',
      productId: asset.product.id,
    }));
  }

  async getHistory(user: User) {
    return this.downloadRecordRepository.find({
      where: { user: { id: user.id } },
      relations: ['product'],
      order: { downloadDate: 'DESC' },
    });
  }

  async getNotifications(user: User) {
    const userAssets = await this.userAssetRepository.find({
      where: { user: { id: user.id } },
      relations: ['product'],
    });

    const productIds = userAssets.map((a) => a.product.id);

    if (productIds.length === 0) return [];

    return this.notificationRepository.find({
      where: { product: { id: In(productIds) } },
      relations: ['product'],
      order: { date: 'DESC' },
    });
  }

  async recordDownload(user: User, assetId: string, ip: string) {
    const asset = await this.userAssetRepository.findOne({
      where: { id: assetId, user: { id: user.id } },
      relations: ['product'],
    });

    if (!asset) {
      throw new NotFoundException('Asset not found in your inventory');
    }

    const record = this.downloadRecordRepository.create({
      user,
      product: asset.product,
      version: asset.product.version,
      ip,
    });

    return this.downloadRecordRepository.save(record);
  }

  async getVersions(productId: string) {
    return this.versionRepository.find({
      where: { product: { id: productId } },
      order: { releaseDate: 'DESC' },
    });
  }

  async getLatestChangelog(productId: string) {
    return this.versionRepository.findOne({
      where: { product: { id: productId } },
      order: { releaseDate: 'DESC' },
    });
  }
}
