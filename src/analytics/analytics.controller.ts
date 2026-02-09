import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Post('track/visit')
    async trackVisit(@Body() data: any, @Req() req: any) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
        const userAgent = req.headers['user-agent'];
        return this.analyticsService.recordVisit({
            ...data,
            ip: ip.toString(),
            userAgent,
            userId: data.userId || (req.user?.id),
        });
    }

    @Post('track/event')
    async trackEvent(@Body() data: any) {
        return this.analyticsService.recordEvent(data);
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getStats() {
        return this.analyticsService.getStats();
    }
}
