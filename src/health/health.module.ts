import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '../cache/cache.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TypeOrmModule, CacheModule],
  controllers: [HealthController],
})
export class HealthModule {}
