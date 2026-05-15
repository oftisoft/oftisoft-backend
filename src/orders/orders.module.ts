import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { User } from '../entities/user.entity';
import { SystemConfig } from '../entities/system-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, SystemConfig])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
