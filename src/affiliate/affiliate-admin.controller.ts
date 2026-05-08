import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AffiliateAdminService } from './affiliate-admin.service';
import { AffiliateService } from './affiliate.service';
import { User } from '../entities/user.entity';
import { AffiliateStatus, AffiliateTier } from '../entities/affiliate.entity';
import {
  CommissionStatus,
  CommissionType,
} from '../entities/affiliate-commission.entity';
import {
  WithdrawalStatus,
  WithdrawalMethod,
} from '../entities/affiliate-withdrawal.entity';

@Controller('affiliate/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AffiliateAdminController {
  constructor(
    private readonly affiliateAdminService: AffiliateAdminService,
    private readonly affiliateService: AffiliateService,
  ) {}

  @Get('dashboard')
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async getDashboardStats() {
    return this.affiliateAdminService.getDashboardStats();
  }

  @Get('affiliates')
  @Roles('SuperAdmin', 'Admin', 'Editor', 'Support')
  async getAllAffiliates(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: AffiliateStatus,
    @Query('tier') tier?: AffiliateTier,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.affiliateAdminService.getAllAffiliates(
      {
        status,
        tier,
        search,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      },
      page,
      limit,
    );
  }

  @Get('affiliates/:id')
  @Roles('SuperAdmin', 'Admin', 'Editor', 'Support')
  async getAffiliateById(@Param('id') id: string) {
    return this.affiliateAdminService.getAffiliateById(id);
  }

  @Post('affiliates/:id/approve')
  @Roles('SuperAdmin', 'Admin')
  async approveAffiliate(@Param('id') id: string, @GetUser() user: User) {
    return this.affiliateAdminService.approveAffiliate(id, user.id);
  }

  @Post('affiliates/:id/suspend')
  @Roles('SuperAdmin', 'Admin')
  async suspendAffiliate(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body('reason') reason?: string,
  ) {
    return this.affiliateAdminService.suspendAffiliate(id, user.id, reason);
  }

  @Post('affiliates/:id/ban')
  @Roles('SuperAdmin', 'Admin')
  async banAffiliate(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body('reason') reason?: string,
  ) {
    return this.affiliateAdminService.banAffiliate(id, user.id, reason);
  }

  @Patch('affiliates/:id/tier')
  @Roles('SuperAdmin', 'Admin')
  async updateAffiliateTier(
    @Param('id') id: string,
    @Body('tier') tier: AffiliateTier,
  ) {
    return this.affiliateAdminService.updateAffiliateTier(id, tier);
  }

  @Patch('affiliates/:id/rate')
  @Roles('SuperAdmin', 'Admin')
  async updateAffiliateRate(
    @Param('id') id: string,
    @Body('rate') rate: number,
  ) {
    return this.affiliateAdminService.updateAffiliateRate(id, rate);
  }

  @Post('affiliates/:id/notes')
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async addAffiliateNote(@Param('id') id: string, @Body('note') note: string) {
    return this.affiliateAdminService.addNote(id, note);
  }

  @Get('commissions')
  @Roles('SuperAdmin', 'Admin', 'Editor', 'Support')
  async getAllCommissions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: CommissionStatus,
    @Query('affiliateId') affiliateId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.affiliateAdminService.getAllCommissions(
      {
        status,
        affiliateId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      },
      page,
      limit,
    );
  }

  @Post('commissions/:id/approve')
  @Roles('SuperAdmin', 'Admin')
  async approveCommission(@Param('id') id: string, @GetUser() user: User) {
    return this.affiliateAdminService.approveCommission(id, user.id);
  }

  @Post('commissions/:id/reject')
  @Roles('SuperAdmin', 'Admin')
  async rejectCommission(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body('reason') reason: string,
  ) {
    return this.affiliateAdminService.rejectCommission(id, user.id, reason);
  }

  @Post('commissions/bulk-approve')
  @Roles('SuperAdmin', 'Admin')
  async bulkApproveCommissions(
    @GetUser() user: User,
    @Body('ids') ids: string[],
  ) {
    return this.affiliateAdminService.bulkApproveCommissions(ids, user.id);
  }

  @Get('withdrawals')
  @Roles('SuperAdmin', 'Admin', 'Editor', 'Support')
  async getAllWithdrawals(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: WithdrawalStatus,
    @Query('affiliateId') affiliateId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.affiliateAdminService.getAllWithdrawals(
      {
        status,
        affiliateId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      },
      page,
      limit,
    );
  }

  @Post('withdrawals/:id/approve')
  @Roles('SuperAdmin', 'Admin')
  async approveWithdrawal(@Param('id') id: string, @GetUser() user: User) {
    return this.affiliateAdminService.approveWithdrawal(id, user.id);
  }

  @Post('withdrawals/:id/process')
  @Roles('SuperAdmin', 'Admin')
  async processWithdrawal(@Param('id') id: string, @GetUser() user: User) {
    return this.affiliateAdminService.processWithdrawal(id, user.id);
  }

  @Post('withdrawals/:id/complete')
  @Roles('SuperAdmin', 'Admin')
  async completeWithdrawal(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body('transactionId') transactionId: string,
  ) {
    return this.affiliateAdminService.completeWithdrawal(
      id,
      user.id,
      transactionId,
    );
  }

  @Post('withdrawals/:id/reject')
  @Roles('SuperAdmin', 'Admin')
  async rejectWithdrawal(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body('reason') reason: string,
  ) {
    return this.affiliateAdminService.rejectWithdrawal(id, user.id, reason);
  }

  @Get('settings')
  @Roles('SuperAdmin', 'Admin')
  async getSettings() {
    return this.affiliateAdminService.getSettings();
  }

  @Patch('settings')
  @Roles('SuperAdmin', 'Admin')
  async updateSettings(@Body() settings: Record<string, unknown>) {
    return this.affiliateAdminService.updateSettings(settings);
  }

  @Get('enums')
  @Roles('SuperAdmin', 'Admin', 'Editor', 'Support')
  getEnums() {
    return {
      tiers: Object.values(AffiliateTier),
      statuses: Object.values(AffiliateStatus),
      commissionStatuses: Object.values(CommissionStatus),
      commissionTypes: Object.values(CommissionType),
      withdrawalStatuses: Object.values(WithdrawalStatus),
      withdrawalMethods: Object.values(WithdrawalMethod),
    };
  }
}
