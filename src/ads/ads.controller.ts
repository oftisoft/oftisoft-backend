import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AdsService } from './ads.service';
import { Ad, AdPosition } from '../entities/ad.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ads')
export class AdsController {
    constructor(private readonly adsService: AdsService) { }

    @Get('public/:position')
    findActiveByPosition(@Param('position') position: AdPosition) {
        return this.adsService.findActiveByPosition(position);
    }

    @Post('track-view/:id')
    trackImpression(@Param('id') id: string) {
        return this.adsService.trackImpression(id);
    }

    @Post('track-click/:id')
    trackClick(@Param('id') id: string) {
        return this.adsService.trackClick(id);
    }

    // Admin Routes
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    findAll() {
        return this.adsService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    findOne(@Param('id') id: string) {
        return this.adsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    create(@Body() adData: Partial<Ad>) {
        return this.adsService.create(adData);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    update(@Param('id') id: string, @Body() adData: Partial<Ad>) {
        return this.adsService.update(id, adData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.adsService.remove(id);
    }
}
