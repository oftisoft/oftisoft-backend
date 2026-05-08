import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  getUserConversations(@Req() req) {
    return this.messagesService.getUserConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('support-bot')
  getSupportBot() {
    return this.messagesService.getSupportBot();
  }

  @UseGuards(JwtAuthGuard)
  @Get('available-users')
  getAvailableUsers(@Req() req) {
    return this.messagesService.getAvailableUsersForMessaging(
      req.user.id,
      req.user.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId/read')
  markAsRead(@Req() req, @Param('conversationId') conversationId: string) {
    return this.messagesService.markConversationAsRead(
      conversationId,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId')
  getMessages(@Req() req, @Param('conversationId') conversationId: string) {
    return this.messagesService.getMessages(conversationId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId/search')
  searchMessages(
    @Param('conversationId') conversationId: string,
    @Query('query') query: string,
  ) {
    return this.messagesService.searchMessages(conversationId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':conversationId')
  sendMessage(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @Body() body: { content: string; replyToId?: string; attachments?: any[] },
  ) {
    return this.messagesService.sendMessage(
      req.user.id,
      conversationId,
      body.content,
      body.replyToId,
      body.attachments,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createConversation(@Req() req, @Body() body: { recipientId: string }) {
    return this.messagesService.createConversation(
      req.user.id,
      body.recipientId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('message/:messageId')
  editMessage(
    @Req() req,
    @Param('messageId') messageId: string,
    @Body() body: { content: string },
  ) {
    return this.messagesService.editMessage(
      messageId,
      req.user.id,
      body.content,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('message/:messageId')
  deleteMessage(@Req() req, @Param('messageId') messageId: string) {
    return this.messagesService.deleteMessage(
      messageId,
      req.user.id,
      req.user.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('message/:messageId/reaction')
  addReaction(
    @Req() req,
    @Param('messageId') messageId: string,
    @Body() body: { emoji: string },
  ) {
    return this.messagesService.addReaction(messageId, req.user.id, body.emoji);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('message/:messageId/reaction/:emoji')
  removeReaction(
    @Req() req,
    @Param('messageId') messageId: string,
    @Param('emoji') emoji: string,
  ) {
    return this.messagesService.removeReaction(messageId, req.user.id, emoji);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':conversationId/pin')
  pinConversation(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @Body() body: { pinned: boolean },
  ) {
    return this.messagesService.pinConversation(
      conversationId,
      req.user.id,
      body.pinned,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':conversationId/mute')
  muteConversation(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @Body() body: { muted: boolean },
  ) {
    return this.messagesService.muteConversation(
      conversationId,
      req.user.id,
      body.muted,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('block/:userId')
  blockUser(@Req() req, @Param('userId') userId: string) {
    return this.messagesService.blockUser(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('block/:userId')
  unblockUser(@Req() req, @Param('userId') userId: string) {
    return this.messagesService.unblockUser(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    return this.messagesService.uploadAttachment(file);
  }
}
