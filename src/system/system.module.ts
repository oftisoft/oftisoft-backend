import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { SystemConfig } from '../entities/system-config.entity';
import { ApiKey } from '../entities/api-key.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Project } from '../entities/project.entity';
import { Category } from '../entities/category.entity';
import { SeederService } from './seeder.service';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Portfolio } from '../entities/portfolio.entity';
import { AuditModule } from '../audit/audit.module';

import { SystemPublicController } from './system-public.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemConfig,
      User,
      ApiKey,
      EmailTemplate,
      Product,
      Project,
      Category,
      Conversation,
      Message,
      SubscriptionPlan,
      Portfolio,
    ]),
    AuditModule,
  ],
  controllers: [SystemController, SystemPublicController],
  providers: [SystemService, SeederService],
  exports: [SystemService, SeederService],
})
export class SystemModule {}
