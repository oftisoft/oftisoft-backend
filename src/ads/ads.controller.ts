import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdPosition } from '../entities/ad.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { User } from '../entities/user.entity';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('public/:position')
  @Public()
  findActiveByPosition(@Param('position') position: AdPosition) {
    return this.adsService.findActiveByPosition(position);
  }

  @Post('track-view/:id')
  @Public()
  trackImpression(@Param('id') id: string) {
    return this.adsService.trackImpression(id);
  }

  @Post('track-click/:id')
  @Public()
  trackClick(@Param('id') id: string) {
    return this.adsService.trackClick(id);
  }

  // Admin Routes
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findAll() {
    return this.adsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async findOne(@Param('id') id: string) {
    const ad = await this.adsService.findOne(id);
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    return ad;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  create(@Body() adData: CreateAdDto) {
    return this.adsService.create(adData);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  update(@Param('id') id: string, @Body() adData: UpdateAdDto) {
    return this.adsService.update(id, adData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  remove(@Param('id') id: string) {
    return this.adsService.remove(id);
  }
}
