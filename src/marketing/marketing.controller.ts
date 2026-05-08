import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('coupons')
  getCoupons() {
    return this.marketingService.getCoupons();
  }

  @Post('coupons')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  createCoupon(@Body() data: any) {
    return this.marketingService.createCoupon(data);
  }

  @Put('coupons/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  updateCoupon(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateCoupon(id, data);
  }

  @Delete('coupons/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  deleteCoupon(@Param('id') id: string) {
    return this.marketingService.deleteCoupon(id);
  }

  @Get('bundles')
  getBundles() {
    return this.marketingService.getBundles();
  }

  @Post('bundles')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  createBundle(@Body() data: any) {
    return this.marketingService.createBundle(data);
  }

  @Put('bundles/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  updateBundle(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateBundle(id, data);
  }

  @Get('products')
  getProducts() {
    return this.marketingService.getProducts();
  }

  @Delete('bundles/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  deleteBundle(@Param('id') id: string) {
    return this.marketingService.deleteBundle(id);
  }

  @Get('subscription-plans')
  getSubscriptionPlans() {
    return this.marketingService.getSubscriptionPlans();
  }

  @Post('subscription-plans')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  createSubscriptionPlan(@Body() data: any) {
    return this.marketingService.createSubscriptionPlan(data);
  }

  @Put('subscription-plans/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  updateSubscriptionPlan(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateSubscriptionPlan(id, data);
  }

  @Delete('subscription-plans/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  deleteSubscriptionPlan(@Param('id') id: string) {
    return this.marketingService.deleteSubscriptionPlan(id);
  }
}
