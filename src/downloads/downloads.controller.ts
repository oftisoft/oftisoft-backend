import { Controller, Get, Post, UseGuards, Param, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DownloadsService } from './downloads.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import type { Request } from 'express';

@Controller('downloads')
@UseGuards(JwtAuthGuard)
export class DownloadsController {
    constructor(private readonly downloadsService: DownloadsService) { }

    @Get('inventory')
    async getInventory(@GetUser() user: User) {
        return this.downloadsService.getInventory(user);
    }

    @Get('history')
    async getHistory(@GetUser() user: User) {
        const history = await this.downloadsService.getHistory(user);
        return history.map(h => ({
            id: h.id,
            productName: h.product.name,
            version: h.version,
            date: h.downloadDate.toISOString().replace('T', ' ').substring(0, 16),
            ip: h.ip,
        }));
    }

    @Get('notifications')
    async getNotifications(@GetUser() user: User) {
        const notes = await this.downloadsService.getNotifications(user);
        return notes.map(n => ({
            id: n.id,
            productId: n.product.id,
            productName: n.product.name,
            oldVersion: n.oldVersion,
            newVersion: n.newVersion,
            date: n.date.toISOString().split('T')[0],
            importance: n.importance,
        }));
    }

    @Post(':id/record')
    async recordDownload(
        @GetUser() user: User,
        @Param('id') assetId: string,
        @Req() req: Request
    ) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
        return this.downloadsService.recordDownload(user, assetId, ip.toString());
    }

    @Get(':productId/versions')
    async getVersions(@Param('productId') productId: string) {
        return this.downloadsService.getVersions(productId);
    }

    @Get(':productId/changelog')
    async getChangelog(@Param('productId') productId: string) {
        return this.downloadsService.getLatestChangelog(productId);
    }
}
