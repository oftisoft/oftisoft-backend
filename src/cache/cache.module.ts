import { Module, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('CacheModule');
        try {
          const { redisStore } = await import('cache-manager-redis-store');
          return {
            store: (await redisStore({
              socket: {
                host: configService.get('REDIS_HOST', 'localhost'),
                port: +configService.get('REDIS_PORT', 6379),
              },
              password: configService.get('REDIS_PASSWORD'),
            })) as any,
            ttl: 300,
          };
        } catch (e) {
          logger.warn(`Redis unavailable (${(e as Error).message}), falling back to in-memory cache`);
          return { ttl: 300 };
        }
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
