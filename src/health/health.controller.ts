import { Controller, Get, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @Public()
  async check() {
    let database = { status: 'up' };
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = { status: 'down' };
    }

    let cache = { status: 'up' };
    try {
      await this.cacheManager.set('health-check', 'ok', 10);
      const result = await this.cacheManager.get('health-check');
      if (result !== 'ok') {
        cache = { status: 'down' };
      }
    } catch {
      cache = { status: 'down' };
    }

    const allUp = database.status === 'up' && cache.status === 'up';

    return {
      status: allUp ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        api: { status: 'up' },
        database,
        cache,
      },
    };
  }
}
