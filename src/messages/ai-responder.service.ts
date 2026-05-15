import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Message } from '../entities/message.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AIResponderService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Message)
    private messagesRepo: Repository<Message>,
    private aiService: AiService,
  ) {}

  async generateResponse(userMessage: string): Promise<string> {
    return this.aiService.generateSupportResponse(userMessage);
  }

  async getOrCreateAIBot(): Promise<User> {
    let bot = await this.usersRepo.findOne({
      where: { isAI: true, email: 'sarah@oftisoft.com' },
    });

    if (!bot) {
      bot = this.usersRepo.create({
        email: 'sarah@oftisoft.com',
        name: 'Sarah - Oftisoft Support',
        jobTitle: 'Senior Support Architect',
        bio: 'Professional support architect at Oftisoft with expertise in client relations and software implementation.',
        isAI: true,
        role: 'Support',
        isActive: true,
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
      });
      await this.usersRepo.save(bot);
    }

    return bot;
  }

  async handleIncomingMessage(message: Message) {
    const conversation = message.conversation;
    const bot = await this.getOrCreateAIBot();

    setTimeout(
      async () => {
        const replyContent = await this.generateResponse(message.content);

        const reply = this.messagesRepo.create({
          content: replyContent,
          sender: bot,
          conversation: conversation,
          read: false,
        });

        await this.messagesRepo.save(reply);
      },
      1500 + Math.random() * 2000,
    );
  }
}
