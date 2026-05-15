import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../entities/system-config.entity';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  private cached: boolean | null = null;
  private lastCheck = 0;

  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const path = req.path;

    // Allow health checks, login, public config through during maintenance
    if (
      path === '/api/health' ||
      path === '/api/auth/login' ||
      path === '/api/auth/register' ||
      path === '/api/system/public/config' ||
      path.startsWith('/api/docs')
    ) {
      return next();
    }

    // Cache check for 30 seconds
    const now = Date.now();
    if (this.cached === null || now - this.lastCheck > 30000) {
      try {
        const config = await this.configRepository.findOne({ where: {} });
        this.cached = config?.maintenanceMode === true;
        this.lastCheck = now;
      } catch {
        this.cached = false;
      }
    }

    if (this.cached) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'Site is currently under maintenance. Please check back shortly.',
        retryAfter: 60,
      });
    }

    next();
  }
}
