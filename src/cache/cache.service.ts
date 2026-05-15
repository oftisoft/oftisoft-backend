import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }
    const value = await fetchFn();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const cache = this.cacheManager as any;
    const keys = await cache.store.keys(pattern);
    if (keys && keys.length > 0) {
      await Promise.all(keys.map((key: string) => cache.del(key)));
    }
  }
}
