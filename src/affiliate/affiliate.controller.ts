import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { User } from '../entities/user.entity';

@Controller('affiliate')
@UseGuards(JwtAuthGuard)
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Get('stats')
  async getStats(@GetUser() user: User) {
    return this.affiliateService.getStats(user.id);
  }

  @Get('methods')
  async getWithdrawalMethods() {
    return this.affiliateService.getWithdrawalMethods();
  }

  @Post('withdraw')
  async requestWithdrawal(
    @GetUser() user: User,
    @Body() data: RequestWithdrawalDto,
  ) {
    return this.affiliateService.requestWithdrawal(user.id, data);
  }

  @Post('withdraw/:id/cancel')
  async cancelWithdrawal(@GetUser() user: User, @Param('id') id: string) {
    return this.affiliateService.cancelWithdrawal(user.id, id);
  }
}
