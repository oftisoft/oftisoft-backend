import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RejectProductDto } from './dto/reject-product.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../entities/audit-log.entity';
import { NotificationsService } from '../notifications/notifications.service';
import type { Request } from 'express';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProductsController {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  @Get('pending')
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async getPendingProducts(@Query('status') status: string = 'pending') {
    const where: Record<string, unknown> = {};

    if (status !== 'all') {
      where.status = status;
    } else {
      where.status = In(['pending', 'approved', 'rejected']);
    }

    const products = await this.productRepository.find({
      where,
      relations: ['vendor'],
      order: { createdAt: 'DESC' },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      status: product.status,
      createdAt: product.createdAt,
      vendorId: product.vendor?.id,
      vendorName: product.vendor?.name || 'Unknown',
      rejectionReason: product.rejectionReason,
    }));
  }

  @Post(':id/approve')
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async approveProduct(
    @Param('id') id: string,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['vendor'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const oldStatus = product.status;
    product.status = 'approved';
    product.rejectionReason = null;
    product.approvedAt = new Date();

    await this.productRepository.save(product);

    await this.auditService.log(
      user.id,
      user.email,
      user.role,
      AuditAction.PRODUCT_APPROVED,
      'product',
      product.id,
      { status: oldStatus },
      { status: 'approved' },
      `Product "${product.name}" approved`,
      req,
    );

    if (product.vendor) {
      await this.notificationsService.create(product.vendor.id, {
        type: 'product_approved',
        title: 'Product Approved',
        description: `Your product "${product.name}" has been approved and is now live.`,
        link: `/products/${product.slug}`,
        priority: 'normal',
      });
    }

    return {
      success: true,
      message: 'Product approved successfully',
    };
  }

  @Post(':id/reject')
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async rejectProduct(
    @Param('id') id: string,
    @Body() body: RejectProductDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['vendor'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const oldStatus = product.status;
    product.status = 'rejected';
    product.rejectionReason = body.reason;

    await this.productRepository.save(product);

    await this.auditService.log(
      user.id,
      user.email,
      user.role,
      AuditAction.PRODUCT_REJECTED,
      'product',
      product.id,
      { status: oldStatus },
      { status: 'rejected', rejectionReason: body.reason },
      `Product "${product.name}" rejected: ${body.reason}`,
      req,
    );

    if (product.vendor) {
      await this.notificationsService.create(product.vendor.id, {
        type: 'product_rejected',
        title: 'Product Rejected',
        description: `Your product "${product.name}" has been rejected. Reason: ${body.reason}`,
        link: `/vendor/products/${product.id}`,
        priority: 'high',
      });
    }

    return {
      success: true,
      message: 'Product rejected',
    };
  }
}
