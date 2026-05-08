import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system/public')
export class SystemPublicController {
  constructor(private systemService: SystemService) {}

  @Get('config')
  async getPublicConfig() {
    const config = await this.systemService.getConfig();
    return {
      stripePublishableKey: config.stripePublishableKey,
      paypalClientId: config.paypalClientId,
      shopName: config.shopName,
      currency: config.currency,
    };
  }
}
