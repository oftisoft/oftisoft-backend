import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { UserAsset } from '../entities/user-asset.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@Controller('orders')
export class OrderSuccessController {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(UserAsset)
    private userAssetRepository: Repository<UserAsset>,
  ) {}

  @Get(':id/success')
  @UseGuards(JwtAuthGuard)
  async getOrderSuccess(
    @Param('id', ParseUUIDPipe) orderId: string,
    @GetUser() user: User,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'items'],
    });

    if (!order || order.user.id !== user.id) {
      throw new NotFoundException('Order not found');
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      throw new NotFoundException('Order not completed');
    }

    // Format order items with license keys
    const items = await Promise.all(
      order.items.map(async (item) => {
        // Get user asset for this product
        const userAsset = await this.userAssetRepository.findOne({
          where: { user: { id: user.id } },
          relations: ['product'],
        });

        return {
          id: item.id,
          product: {
            id: item.productId,
            name: item.productName,
            price: item.price,
          },
          quantity: item.quantity,
          price: item.price,
          licenseKey: userAsset?.licenseKey || null,
          downloadUrl: item.downloadUrl || null,
        };
      }),
    );

    // Calculate totals
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = 0; // Calculate based on your business logic
    const total = order.total;

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.id.slice(0, 8).toUpperCase(),
        status: order.status,
        createdAt: order.createdAt,
        completedAt: order.updatedAt,
      },
      items,
      totals: {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        currency: 'USD',
      },
      customer: {
        name: user.name,
        email: user.email,
      },
      message:
        'Thank you for your purchase! Your order has been completed successfully.',
    };
  }

  @Get(':orderNumber/verify')
  async verifyOrder(@Param('orderNumber') orderNumber: string) {
    // Try to find by order ID (first 8 chars)
    const order = await this.orderRepository.findOne({
      where: { id: orderNumber },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      exists: true,
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}
