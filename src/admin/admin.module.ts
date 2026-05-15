import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProductsController } from './admin-products.controller';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Notification } from '../entities/notification.entity';
import { AuditService } from '../audit/audit.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User, AuditLog, Notification]),
    NotificationsModule,
  ],
  controllers: [AdminProductsController],
  providers: [AuditService],
})
export class AdminModule {}
