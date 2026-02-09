import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('affiliate')
@UseGuards(JwtAuthGuard)
export class AffiliateController {
    constructor(private readonly affiliateService: AffiliateService) { }

    @Get('stats')
    async getStats(@Req() req: any) {
        return this.affiliateService.getStats(req.user.id);
    }

    @Post('withdraw')
    async requestWithdrawal(@Req() req: any, @Body() data: { amount: number; method: string }) {
        return this.affiliateService.requestWithdrawal(req.user.id, data);
    }
}
