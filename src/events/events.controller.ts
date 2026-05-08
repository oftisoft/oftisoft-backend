import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Event, EventStatus } from '../entities/event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Public endpoints
  @Get()
  async findAll(
    @Query('status') status?: EventStatus,
    @Query('type') type?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.eventsService.findAll({
      status,
      type,
      upcoming: upcoming === 'true',
    });
  }

  @Get('upcoming')
  async getUpcoming() {
    return this.eventsService.findAll({
      upcoming: true,
      status: EventStatus.PUBLISHED,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  // Protected endpoints - require authentication
  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  async register(
    @Param('id') eventId: string,
    @Request() req: any,
    @Body('customFields') customFields?: Record<string, string>,
  ) {
    return this.eventsService.register(eventId, req.user.id, customFields);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  async cancelRegistration(@Param('id') eventId: string, @Request() req: any) {
    await this.eventsService.cancelRegistration(eventId, req.user.id);
    return { message: 'Registration cancelled' };
  }

  @Get('my/registrations')
  @UseGuards(JwtAuthGuard)
  async getMyRegistrations(@Request() req: any) {
    return this.eventsService.getUserRegistrations(req.user.id);
  }

  @Get(':id/registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async getRegistrations(@Param('id') eventId: string) {
    return this.eventsService.getRegistrations(eventId);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async create(@Body() eventData: Partial<Event>, @Request() req: any) {
    return this.eventsService.create({
      ...eventData,
      createdBy: req.user.id,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async update(@Param('id') id: string, @Body() eventData: Partial<Event>) {
    return this.eventsService.update(id, eventData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin')
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
    return { message: 'Event deleted' };
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async publish(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  @Put('registrations/:registrationId/attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Editor')
  async markAttendance(
    @Param('registrationId') registrationId: string,
    @Body('attended') attended: boolean,
  ) {
    return this.eventsService.markAttendance(registrationId, attended);
  }
}
