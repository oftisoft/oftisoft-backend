import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async getIntegrations() {
    return this.integrationsService.getIntegrations();
  }

  @Post(':id/toggle')
  async toggleIntegration(
    @Param('id') id: string,
    @Body('connected') connected: boolean,
  ) {
    return this.integrationsService.toggleIntegration(id, connected);
  }
}
