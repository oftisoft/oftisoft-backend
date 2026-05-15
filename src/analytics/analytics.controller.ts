import { Controller, Get, Post, Body, Query, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackVisitDto } from './dto/track-visit.dto';
import { TrackEventDto } from './dto/track-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track/visit')
  async trackVisit(@Body() data: TrackVisitDto) {
    return this.analyticsService.recordVisit(data);
  }

  @Post('track/event')
  async trackEvent(@Body() data: TrackEventDto) {
    return this.analyticsService.recordEvent(data);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Editor')
  async getStats(@Query('timeRange') timeRange?: string) {
    const range = (timeRange as 'day' | 'week' | 'month') || 'week';
    return this.analyticsService.getStats(range);
  }

  @Get('export/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Editor')
  async exportPdf(
    @Res() res: Response,
    @Query('timeRange') timeRange?: string,
  ) {
    const range = (timeRange as 'day' | 'week' | 'month') || 'week';
    const pdf = await this.analyticsService.exportStatsPdf(range);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="analytics-report.pdf"',
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }
}
