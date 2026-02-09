
import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @UseGuards(JwtAuthGuard)
    @Get('conversations')
    getUserConversations(@Req() req) {
        return this.messagesService.getUserConversations(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('support-bot')
    getSupportBot() {
        return this.messagesService.getSupportBot();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':conversationId')
    getMessages(@Param('conversationId') conversationId: string) {
        return this.messagesService.getMessages(conversationId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':conversationId')
    sendMessage(
        @Req() req,
        @Param('conversationId') conversationId: string,
        @Body() body: { content: string }
    ) {
        return this.messagesService.sendMessage(req.user.userId, conversationId, body.content);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createConversation(
        @Req() req,
        @Body() body: { recipientId: string }
    ) {
        return this.messagesService.createConversation(req.user.userId, body.recipientId);
    }
}
