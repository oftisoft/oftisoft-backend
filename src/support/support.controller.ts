import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { TicketStatus, TicketPriority } from '../entities/ticket.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  createTicket(
    @Body('subject') subject: string,
    @Body('category') category: string,
    @Body('priority') priority: TicketPriority,
    @Body('description') description: string,
    @GetUser() user: User,
  ) {
    return this.supportService.createTicket(
      subject,
      category,
      priority,
      description,
      user,
    );
  }

  @Get('tickets')
  findAll(@GetUser() user: User, @Query('status') status?: TicketStatus) {
    return this.supportService.findAll(user, status);
  }

  @Get('stats')
  getStats() {
    return this.supportService.getStats();
  }

  @Get('tickets/:id')
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }

  @Patch('tickets/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus) {
    return this.supportService.updateStatus(id, status);
  }

  @Post('tickets/:id/messages')
  addMessage(
    @Param('id') id: string,
    @Body('content') content: string,
    @GetUser() user: User,
  ) {
    return this.supportService.addMessage(id, content, user);
  }
}
