import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { Campaign } from '../entities/campaign.entity';
import { Lead } from '../entities/lead.entity';
import { AuthModule } from '../auth/auth.module';
import { LeadModule } from '../leads/leads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, Lead]),
    AuthModule,
    LeadModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
