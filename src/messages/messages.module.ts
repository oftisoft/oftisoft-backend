import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { AIResponderService } from './ai-responder.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User, BlockedUser]),
    AiModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, AIResponderService],
  exports: [MessagesService, AIResponderService],
})
export class MessagesModule {}
