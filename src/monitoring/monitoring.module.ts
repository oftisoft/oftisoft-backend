import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { SentryFilter } from './sentry.filter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryFilter,
    },
  ],
})
export class MonitoringModule implements OnModuleInit {
  private readonly logger = new Logger(MonitoringModule.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN');

    if (dsn) {
      Sentry.init({
        dsn,
        environment: this.configService.get('NODE_ENV', 'development'),
        tracesSampleRate: 0.2,
        beforeSend(event) {
          if (event.exception) {
            const values = event.exception.values;
            if (values && values[0]) {
              const type = values[0].type || '';
              if (
                type.includes('NotFoundException') ||
                type.includes('BadRequestException') ||
                type.includes('UnauthorizedException') ||
                type.includes('ForbiddenException')
              ) {
                return null;
              }
            }
          }
          return event;
        },
      });

      this.logger.log('Sentry error tracking initialized');
    } else {
      this.logger.warn('SENTRY_DSN not set. Skipping Sentry initialization.');
    }
  }
}
