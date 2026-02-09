
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    getNotifications(@Req() req) {
        return this.notificationsService.getUserNotifications(req.user.userId);
    }

    @Get('archived')
    getArchivedNotifications(@Req() req) {
        return this.notificationsService.getArchivedNotifications(req.user.userId);
    }

    @Post()
    create(@Req() req, @Body() body: any) {
        // This endpoint might be used for testing, but ideally notifications are created internally
        return this.notificationsService.create(req.user.userId, body);
    }

    @Put(':id/read')
    markAsRead(@Req() req, @Param('id') id: string) {
        return this.notificationsService.markAsRead(req.user.userId, id);
    }

    @Put('read-all')
    markAllAsRead(@Req() req) {
        return this.notificationsService.markAllAsRead(req.user.userId);
    }

    @Put(':id/archive')
    archive(@Req() req, @Param('id') id: string) {
        return this.notificationsService.archive(req.user.userId, id);
    }

    @Delete(':id')
    delete(@Req() req, @Param('id') id: string) {
        return this.notificationsService.delete(req.user.userId, id);
    }
}
