import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliateLinksController } from './affiliate-links.controller';
import { AffiliateLinksService } from './affiliate-links.service';
import { AffiliateLink } from '../entities/affiliate-link.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AffiliateLink])],
  controllers: [AffiliateLinksController],
  providers: [AffiliateLinksService],
  exports: [AffiliateLinksService],
})
export class AffiliateLinksModule {}
