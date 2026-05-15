import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LeadService } from './leads.service';
import { LeadStatus } from '../entities/lead.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Lead } from '../entities/lead.entity';
import { SubscribeDto } from './dto/subscribe.dto';
import { PartnerApplicationDto } from './dto/partner-application.dto';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post('subscribe')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  subscribe(@Body() dto: SubscribeDto) {
    return this.leadService.subscribe(dto);
  }

  @Post('partner-application')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  partnerApplication(@Body() dto: PartnerApplicationDto) {
    return this.leadService.createPartnerApplication(dto);
  }

  @Post()
  create(@Body() data: any): Promise<Lead> {
    return this.leadService.createLead(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Editor', 'Support')
  findAll(): Promise<Lead[]> {
    return this.leadService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Editor', 'Support')
  getStats() {
    return this.leadService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findOne(@Param('id') id: string): Promise<Lead> {
    return this.leadService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  updateStatus(@Param('id') id: string, @Body('status') status: LeadStatus) {
    return this.leadService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  remove(@Param('id') id: string) {
    return this.leadService.deleteLead(id);
  }
}
