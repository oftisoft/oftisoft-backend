import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: any = null;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {
    this.initOpenAI();
  }

  private initOpenAI() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      try {
        const OpenAI = require('openai');
        this.openai = new OpenAI({ apiKey });
        this.logger.log('OpenAI client initialized');
      } catch {
        this.logger.warn('OpenAI package not installed, using fallback mode');
      }
    } else {
      this.logger.warn('OPENAI_API_KEY not set, using fallback mode');
    }
  }

  private getSystemPrompt(pageKey?: string): string {
    const base = `You are an AI assistant for Oftisoft, a premium software development company. 
You help users generate content, SEO metadata, descriptions, titles, and code snippets.
Be concise, professional, and helpful.`;

    const pagePrompts: Record<string, string> = {
      posts: `Focus on blog post content: titles, excerpts, SEO keywords, meta descriptions, categories, and tags.`,
      products: `Focus on product descriptions, feature lists, pricing strategies, technical specs, and comparison content.`,
      services: `Focus on service descriptions, process explanations, technology stacks, and value propositions.`,
      analytics: `Focus on data interpretation, KPI analysis, report summaries, and performance insights.`,
    };

    return `${base}\n${pagePrompts[pageKey || ''] || 'Provide general assistance with content generation and technical tasks.'}\nKeep responses under 200 words.`;
  }

  async generateResponse(
    message: string,
    pageKey?: string,
  ): Promise<string> {
    if (!this.openai) {
      return this.fallbackResponse(message);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.getSystemPrompt(pageKey) },
          { role: 'user', content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return (
        completion.choices?.[0]?.message?.content ||
        'I could not generate a response. Please try again.'
      );
    } catch (error: any) {
      this.logger.error('OpenAI API error:', error?.message || error);
      return this.fallbackResponse(message);
    }
  }

  private fallbackResponse(message: string): string {
    const msg = message.toLowerCase();

    if (msg.includes('title') || msg.includes('headline') || msg.includes('head')) {
      return `Based on your input, here are some title suggestions:\n\n1. "Transform Your Digital Vision with Oftisoot Premium Solutions"\n2. "Enterprise-Grade Software Development for Modern Business"\n3. "From Concept to Deployment: Full-Stack Excellence"\n\nWould you like me to refine any of these?`;
    }

    if (msg.includes('seo') || msg.includes('keyword') || msg.includes('meta')) {
      return `Recommended SEO strategy:\n\n• Primary keywords: premium software development, custom web solutions\n• Secondary: enterprise app development, AI integration\n• Meta description: "Oftisoft delivers premium software solutions including web, mobile, and AI development. Transform your business with our expert team."\n\nWould you like a more detailed SEO analysis?`;
    }

    if (msg.includes('description') || msg.includes('describe')) {
      return `Here's a compelling description:\n\n"Oftisoft is a premium software development company specializing in crafting high-performance web applications, mobile solutions, and AI-powered platforms. Our team of expert architects and developers transforms complex requirements into elegant, scalable digital products that drive business growth."\n\nShall I adjust the tone or length?`;
    }

    return `Thank you for your request. Based on Oftisoft's expertise in software development, I recommend the following approach:\n\n1. Define clear objectives and KPIs for your project\n2. Choose the appropriate technology stack (NestJS, React, Python, etc.)\n3. Implement with agile methodology for rapid iteration\n4. Deploy with CI/CD pipelines for reliability\n\nWould you like me to elaborate on any of these points or help with specific content?`;
  }

  async generateSupportResponse(userMessage: string): Promise<string> {
    const systemPrompt = `You are Sarah, a professional and friendly Senior Support Architect at Oftisoft.
Oftisoft is a premium software company specializing in WordPress development, mobile app development (MAUI, React Native), 
backend development (NestJS, Django, Python), AI chatbots, AI automation, full-stack development, and DevOps.
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
- Keep responses under 150 words.`;

    if (this.openai) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 300,
          temperature: 0.7,
        });
        return completion.choices?.[0]?.message?.content || this.basicSupportResponse(userMessage);
      } catch {
        return this.basicSupportResponse(userMessage);
      }
    }

    return this.basicSupportResponse(userMessage);
  }

  private basicSupportResponse(userMessage: string): string {
    const msg = userMessage.toLowerCase();
    if (msg.includes('hello') || msg.includes('hi ') || msg.includes('hey')) {
      return "Greetings! I'm Sarah from the Oftisoft implementation team. How can I assist you with your architectural vision today?";
    }
    if (msg.includes('service') || msg.includes('provide')) {
      return "At Oftisoft, we handle everything related to software solutions. This includes high-performance WordPress sites, mobile apps (MAUI/Full-stack), advanced AI chatbots, and robust DevOps pipelines. What specific stack are you looking to implement?";
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('quote')) {
      return 'We tailor our fiscal protocols to each specific architectural node. I recommend submitting a Request for Quote through your dashboard so our analysts can provide a high-fidelity estimate for your project.';
    }
    return "That's an interesting implementation detail. I've logged this for our senior technical architects to review. Is there anything else I can assist you with in the meantime regarding Oftisoft's service matrix?";
  }
}
