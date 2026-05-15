import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CampaignStatus } from '../entities/campaign.entity';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // Public endpoints (for marketing page display)
  @Get('public')
  async getPublicCampaigns() {
    const campaigns = await this.campaignsService.findAll({
      status: CampaignStatus.ACTIVE,
    });
    return campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      type: c.type,
      startDate: c.startDate,
      endDate: c.endDate,
    }));
  }

  @Get('public/:slug')
  async getPublicCampaign(@Param('slug') slug: string) {
    return this.campaignsService.findBySlug(slug);
  }

  // Stats
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async getStats() {
    return this.campaignsService.getStats();
  }

  // Admin endpoints
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor', 'Support')
  async findAll(
    @Query('status') status?: CampaignStatus,
    @Query('type') type?: string,
  ) {
    return this.campaignsService.findAll({ status, type });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async create(@Body() campaignData: any, @Request() req: any) {
    return this.campaignsService.create({
      ...campaignData,
      createdBy: req.user.id,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async update(@Param('id') id: string, @Body() campaignData: any) {
    return this.campaignsService.update(id, campaignData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin')
  async remove(@Param('id') id: string) {
    await this.campaignsService.remove(id);
    return { message: 'Campaign deleted' };
  }

  @Put(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async start(@Param('id') id: string) {
    return this.campaignsService.start(id);
  }

  @Put(':id/pause')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async pause(@Param('id') id: string) {
    return this.campaignsService.pause(id);
  }

  @Put(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async complete(@Param('id') id: string) {
    return this.campaignsService.complete(id);
  }

  @Put(':id/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async updateMetrics(@Param('id') id: string, @Body() metrics: any) {
    return this.campaignsService.updateMetrics(id, metrics);
  }

  @Post(':id/execute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async execute(@Param('id') id: string) {
    return this.campaignsService.executeCampaign(id);
  }

  @Post(':id/send-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async sendTest(
    @Param('id') id: string,
    @Body('email') email: string,
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.campaignsService.sendTestEmail(id, email);
  }
}
