import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class AIResponderService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Message)
    private messagesRepo: Repository<Message>,
  ) {}

  private readonly supportPrompt = `You are Sarah, a professional and friendly Senior Support Architect at Oftisoft.
Oftisoft is a premium software company specializing in WordPress development, mobile app development (MAUI, React Native), backend development (NestJS, Django, Python), AI chatbots, AI automation, full-stack development, and DevOps.
The founder is Rasel Hossain, who has 6 years of professional experience.

Your tone should be:
- Professional yet approachable
- Highly knowledgeable about software engineering
- Helpful and proactive
- Concise but comprehensive

Rules:
- Do not mention you are an AI.
- If you don't know something, offer to flag it for a technical architect.
- Always refer to the user as "Architect" or "Partner".
- Mention Oftisoft's commitment to modern, attractive, and engaging platforms.

Current Message: `;

  async generateResponse(userMessage: string): Promise<string> {
    // Since we don't have a real LLM connected yet, we'll use a sophisticated rule-based simulation
    // that feels human for the demonstration. In a real production app, this would call OpenAI/Gemini.

    const msg = userMessage.toLowerCase();

    if (msg.includes('hello') || msg.includes('hi ') || msg.includes('hey')) {
      return "Greetings! I'm Sarah from the Oftisoft implementation team. How can I assist you with your architectural vision today?";
    }

    if (
      msg.includes('service') ||
      msg.includes('provide') ||
      msg.includes('do you do')
    ) {
      return "At Oftisoft, we handle everything related to software solutions. This includes high-performance WordPress sites, mobile apps (MAUI/Full-stack), advanced AI chatbots like the one you're interacting with, and robust DevOps pipelines. What specific stack are you looking to implement?";
    }

    if (
      msg.includes('experience') ||
      msg.includes('rasel') ||
      msg.includes('who are you')
    ) {
      return 'Oftisoft is led by Rasel Hossain, an industry veteran with 6 years of professional software architecture experience. We pride ourselves on creating engaging, modern platforms that forge strong connections with users.';
    }

    if (
      msg.includes('dashboard') ||
      msg.includes('login') ||
      msg.includes('access')
    ) {
      return 'Your dashboard is your central node for all Oftisoft services. You can manage your projects, track progress, and access our premium service matrix directly from there.';
    }

    if (
      msg.includes('price') ||
      msg.includes('cost') ||
      msg.includes('quote')
    ) {
      return 'We tailor our fiscal protocols to each specific architectural node. I recommend submitting a Request for Quote through your dashboard so our analysts can provide a high-fidelity estimate for your project.';
    }

    return "That's an interesting implementation detail. I've logged this for our senior technical architects to review. Is there anything else I can assist you with in the meantime regarding Oftisoft's service matrix?";
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
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop', // A professional woman's face
      });
      await this.usersRepo.save(bot);
    }

    return bot;
  }

  async handleIncomingMessage(message: Message) {
    const conversation = message.conversation;
    const bot = await this.getOrCreateAIBot();

    // Check if bot is a participant in this conversation
    // In a direct chat, if the recipient is the bot, we reply
    // In this implementation, we assume if Sarah is in the chat and receives a message from a human, she replies

    // Wait a bit to simulate human typing
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
        // Optionally emit via Socket.io if implemented
      },
      1500 + Math.random() * 2000,
    );
  }
}
