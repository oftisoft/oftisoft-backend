import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class AdminBillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('transactions')
  async getAllTransactions() {
    return this.billingService.getAllTransactions();
  }

  @Get('stats')
  async getFinanceStats() {
    return this.billingService.getFinanceStats();
  }

  @Get('payouts')
  async getPayouts() {
    return this.billingService.getPayouts();
  }

  @Post('process-payout')
  async processPayout(@Body() data: any) {
    return this.billingService.processPayout(data);
  }

  @Get('config')
  async getConfig() {
    return this.billingService.getFinanceConfig();
  }

  @Patch('config')
  async updateConfig(@Body() config: any) {
    return this.billingService.updateFinanceConfig(config);
  }
}
