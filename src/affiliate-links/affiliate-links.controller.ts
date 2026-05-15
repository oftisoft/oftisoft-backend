import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AffiliateLinksService } from './affiliate-links.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('affiliate-links')
export class AffiliateLinksController {
  constructor(private service: AffiliateLinksService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  findAll() { return this.service.findAll(); }

  @Get('active')
  @Public()
  findActive() { return this.service.findActive(); }

  @Get('category/:category')
  @Public()
  findByCategory(@Param('category') category: string) { return this.service.findByCategory(category); }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  getStats() { return this.service.getStats(); }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  create(@Body() data: any) { return this.service.create(data); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':id/click')
  @Public()
  trackClick(@Param('id') id: string) { return this.service.trackClick(id); }
}
