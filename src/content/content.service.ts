import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageContent } from '../entities/page-content.entity';
import { UpdatePageContentDto } from './dto/update-page-content.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(PageContent)
    private pageContentRepository: Repository<PageContent>,
    private configService: ConfigService,
  ) {}

  async generateWithAI(params: {
    prompt: string;
    fieldType?: string;
    pageKey?: string;
    sectionId?: string;
    fieldName?: string;
    context?: string;
  }): Promise<{ text: string }> {
    const { prompt, fieldType, pageKey, sectionId, fieldName, context } =
      params;
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI generation is not configured. Set DEEPSEEK_API_KEY in .env',
      );
    }

    const systemPrompt = this.buildSystemPrompt({
      fieldType,
      pageKey,
      sectionId,
      fieldName,
      context,
    });
    const userMessage =
      prompt.trim() || 'Generate concise, SEO-friendly content.';

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.6,
          max_tokens: 1024,
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new BadRequestException(
        `AI request failed: ${response.status} ${err.slice(0, 200)}`,
      );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new BadRequestException('Empty response from AI');
    }
    return { text };
  }

  private buildSystemPrompt(opts: {
    fieldType?: string;
    pageKey?: string;
    sectionId?: string;
    fieldName?: string;
    context?: string;
  }): string {
    const { fieldType, pageKey, sectionId, fieldName, context } = opts;
    const pageContext = pageKey ? ` for the "${pageKey}" page` : '';
    const sectionContext = sectionId ? ` in section "${sectionId}"` : '';
    const fieldContext = fieldName ? ` for field "${fieldName}"` : '';

    const parts: string[] = [
      'You are an expert SEO and content writer for Oftisoft—a software/tech company (Web, Mobile, AI, DevOps).',
      'Output ONLY the requested content. No quotes, no explanations, no markdown. Match the brand voice: professional, innovative, tech-forward.',
    ];

    if (pageKey) {
      const seed = this.getDefaultContent(pageKey);
      const seedPreview = this.truncateForContext(JSON.stringify(seed), 1200);
      parts.push(
        `\nREFERENCE (seed/default content for style & structure - use as inspiration, match tone):\n${seedPreview}`,
      );
    }

    if (context) {
      parts.push(
        `\nCURRENT PAGE CONTENT (maintain consistency, fill gaps):\n${context.slice(0, 2500)}`,
      );
    }

    parts.push(
      `\nRULES: Generate content${pageContext}${sectionContext}${fieldContext}.`,
    );

    if (fieldType === 'meta_title' || fieldType === 'title') {
      parts.push('Output: single line, under 60 characters.');
    } else if (
      fieldType === 'meta_description' ||
      fieldType === 'description'
    ) {
      parts.push('Output: 1-2 sentences, under 160 characters.');
    } else if (fieldType === 'keywords' || fieldType === 'tags') {
      parts.push('Output: comma-separated keywords only, 5-10 items.');
    } else {
      parts.push(
        'Output: concise, professional content matching the reference style.',
      );
    }

    return parts.join('\n');
  }

  private truncateForContext(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + '...';
  }

  async getAllFiles(): Promise<
    { name: string; url: string; size: number; createdAt: Date }[]
  > {
    const uploadsDir = './uploads';
    try {
      await fs.access(uploadsDir);
    } catch {
      return [];
    }

    const files = await fs.readdir(uploadsDir);
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      }),
    );
    // Sort by newest first
    return fileStats.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getPageContent(pageKey: string): Promise<PageContent> {
    let content = await this.pageContentRepository.findOne({
      where: { pageKey },
    });

    // If content doesn't exist, create default
    if (!content) {
      content = this.pageContentRepository.create({
        pageKey,
        content: this.getDefaultContent(pageKey),
        status: 'draft',
      });
      await this.pageContentRepository.save(content);
    }

    return content;
  }

  async updatePageContent(
    pageKey: string,
    updateDto: UpdatePageContentDto,
  ): Promise<PageContent> {
    let content = await this.pageContentRepository.findOne({
      where: { pageKey },
    });

    if (!content) {
      content = this.pageContentRepository.create({
        pageKey,
        content: updateDto.content || this.getDefaultContent(pageKey),
        status: updateDto.status || 'draft',
      });
    } else {
      if (updateDto.content !== undefined) {
        content.content = updateDto.content;
      }
      if (updateDto.status !== undefined) {
        content.status = updateDto.status;
        if (updateDto.status === 'published') {
          content.publishedAt = new Date();
        }
      }
    }

    return this.pageContentRepository.save(content);
  }

  async publishPageContent(pageKey: string): Promise<PageContent> {
    const content = await this.getPageContent(pageKey);
    content.status = 'published';
    content.publishedAt = new Date();
    return this.pageContentRepository.save(content);
  }

  async getAllPages(): Promise<PageContent[]> {
    return this.pageContentRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  private getDefaultContent(pageKey: string): any {
    // Default content structures for different pages
    const defaults: Record<string, any> = {
      about: {
        hero: {
          badge: 'Evolution & Architecture',
          title: 'We build the',
          highlightedWord: 'meta-layer',
          description:
            'Oftisoft is a hyper-scale design and development operative engineering high-fidelity artifacts for the next generation of digital builders, led by industry veteran Rasel Hossain.',
          ctaText: 'Explore Our Ecosystem',
          cardTitle: 'Global Presence Node',
          cardDescription:
            'Decentralized hubs operating across dozens of zones.',
        },
        stats: [
          {
            id: 'exp',
            label: 'Years of High-Fidelity Experience',
            value: '6+',
            icon: 'ShieldCheck',
          },
          {
            id: 'projects',
            label: 'Neural Artifacts Deployed',
            value: '150+',
            icon: 'Zap',
          },
          {
            id: 'clients',
            label: 'Architect Partnerships',
            value: '80+',
            icon: 'Users',
          },
        ],
        founder: {
          name: 'Rasel Hossain',
          role: 'Founder & Chief Architect',
          tagline: 'Visionary . Engineer . Consultant',
          bioPar1:
            'I am Rasel Hossain, a passionate software engineer and technology consultant with 6 years of professional experience, dedicated to building modern, scalable, and high-performance digital solutions.',
          bioPar2:
            'I founded Ofitsoft to bridge the gap between complex engineering and intuitive design. We provide a wide range of services including WordPress, Mobile Apps (MAUI), Backend, AI Chatbots, and DevOps—handling everything related to software solutions.',
          stats: [
            { num: 6, label: 'Years Exp', suffix: '+' },
            { num: 200, label: 'Nodes Built', suffix: 'K' },
            { num: 100, label: 'Clients', suffix: '%' },
          ],
          socials: {
            github: 'https://github.com',
            linkedin: 'https://linkedin.com',
            twitter: 'https://twitter.com',
          },
        },
        mission: {
          badge: 'Our DNA',
          titleLine1: 'Driven by Purpose,',
          titleLine2: 'Defined by Quality.',
          quote:
            "Our mission is to empower visionaries with the technology they need to change the world. We don't just write code; we architect experiences that matter.",
          quoteHighlight: 'architect experiences',
        },
        values: [
          {
            title: 'Radical Quality',
            description:
              'Near-obsessive focus on every pixel and line of code.',
            icon: 'Target',
          },
          {
            title: 'Neural Innovation',
            description: 'Leveraging the latest in AI and automation.',
            icon: 'Zap',
          },
          {
            title: 'Human Connection',
            description: 'Building lasting partnerships with our clients.',
            icon: 'Handshake',
          },
          {
            title: 'Fearless Engineering',
            description: 'Solving complex problems with confidence.',
            icon: 'ShieldCheck',
          },
        ],
        timeline: [
          {
            year: '2018',
            title: 'Genesis Node',
            desc: 'Rasel Hossain initiates the first development protocols as a solo consultant.',
            icon: 'Zap',
            gradient: 'from-blue-600 to-cyan-400',
          },
          {
            year: '2020',
            title: 'Platform Expansion',
            desc: 'Expanding into enterprise WordPress and mobile architectures.',
            icon: 'Globe',
            gradient: 'from-purple-600 to-pink-500',
          },
          {
            year: '2023',
            title: 'Oftisoft Synthesis',
            desc: 'Formalizing Ofitsoft as a unified high-fidelity engineering operative.',
            icon: 'Rocket',
            gradient: 'from-amber-400 to-orange-500',
          },
          {
            year: '2026',
            title: 'Future Forge',
            desc: 'Leading the way in AI-integrated development and neural sync systems.',
            icon: 'Clock',
            gradient: 'from-emerald-500 to-cyan-500',
          },
        ],
        timelineBadge: 'Our Origins',
        timelineTitle: 'Evolution of',
        timelineTitleHighlight: 'Innovation.',
        culture: {
          badge: 'Life at Ofitsoft',
          titleLine1: 'Where Culture Meets',
          titleLine2: 'Creativity.',
          items: [
            {
              id: '1',
              title: 'Design Session',
              location: 'Oftisoft Lab 01',
              type: 'image',
              size: 'md:col-span-2 md:row-span-2',
              thumb:
                'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
            },
            {
              id: '2',
              title: 'Coffee & Code',
              location: 'Common Zone',
              type: 'image',
              size: 'md:col-span-1 md:row-span-1',
              thumb:
                'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=400&auto=format&fit=crop',
            },
            {
              id: '3',
              title: 'Future Launch',
              location: 'Main Stage',
              type: 'video',
              size: 'md:col-span-1 md:row-span-2',
              thumb:
                'https://images.unsplash.com/photo-1540317580384-e5d418a6293b?q=80&w=400&auto=format&fit=crop',
            },
            {
              id: '4',
              title: 'Tech Talk',
              location: 'Innovation Hub',
              type: 'image',
              size: 'md:col-span-1 md:row-span-1',
              thumb:
                'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop',
            },
          ],
        },
        awardsBadge: 'Hall of Fame',
        awardsTitle: 'Recognized for',
        awardsTitleHighlight: 'Digital Excellence.',
        awardsDescription:
          "Our relentless pursuit of perfection has earned us accolades from the industry's most prestigious bodies.",
        awards: [
          {
            id: 'a1',
            year: '2024',
            title: 'Top Web Architect',
            org: 'Clutch Global',
            description:
              'Recognized as a leading provider of high-fidelity web architectures.',
            gradient: 'from-blue-600 to-cyan-400',
          },
          {
            id: 'a2',
            year: '2023',
            title: 'Innovation Award',
            org: 'Tech Matrix',
            description:
              'Awarded for excellence in AI-integrated mobile solutions.',
            gradient: 'from-purple-600 to-pink-500',
          },
          {
            id: 'a3',
            year: '2022',
            title: 'Design Excellence',
            org: 'Awwwards Node',
            description:
              'Honored for premium aesthetics and engaging user experiences.',
            gradient: 'from-rose-500 to-amber-500',
          },
        ],
        team: {
          badge: 'The Collective',
          titleLine1: 'Architects of the',
          titleLine2: 'Impossible.',
          members: [
            {
              id: 'm1',
              name: 'Rasel Hossain',
              role: 'Chief Architect',
              category: 'Leadership',
              image:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
              gradient: 'from-blue-600 to-cyan-400',
              socials: { github: '#', linkedin: '#', twitter: '#' },
            },
            {
              id: 'm2',
              name: 'Sarah Jenkins',
              role: 'UI Strategist',
              category: 'Design',
              image:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
              gradient: 'from-purple-600 to-pink-500',
              socials: { github: '#', linkedin: '#', twitter: '#' },
            },
            {
              id: 'm3',
              name: 'Mike Thompson',
              role: 'Logic Engineer',
              category: 'Development',
              image:
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
              gradient: 'from-cyan-400 to-emerald-500',
              socials: { github: '#', linkedin: '#', twitter: '#' },
            },
          ],
        },
        cta: {
          badge: 'Join the Protocol',
          title: 'Ready to Forge Your',
          highlight: 'Digital Legacy?',
          description:
            'Connect with our architectural operative today and initiate your next high-fidelity sync.',
          buttonText: 'Initiate Sync Now',
        },
      },
      services: {
        overview: [
          {
            id: 'web',
            label: 'Full-Stack & Web',
            title: 'High-Fidelity Web Architectures.',
            iconName: 'Globe',
            gradient: 'from-blue-600/20 to-cyan-500/20',
            description:
              'Modern, attractive, and engaging web platforms designed to create a strong connection with users. Specialized in WordPress and Full-Stack development.',
            features: [
              {
                title: 'WordPress Mastery',
                desc: 'Custom themes and headless CMS solutions.',
                iconName: 'Layout',
              },
              {
                title: 'React/Next.js',
                desc: 'Performance-optimized modern frontends.',
                iconName: 'Zap',
              },
              {
                title: 'Engaging UI',
                desc: 'Premium designs that WOW your users.',
                iconName: 'Sparkles',
              },
            ],
            techs: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
          },
          {
            id: 'mobile',
            label: 'Mobile Apps',
            title: 'Cross-Platform Neural Sync.',
            iconName: 'Smartphone',
            gradient: 'from-purple-600/20 to-pink-500/20',
            description:
              'Native-quality mobile applications for iOS and Android using MAUI, React Native, and Flutter.',
            features: [
              {
                title: 'MAUI Development',
                desc: 'Enterprise-grade cross-platform apps.',
                iconName: 'Layers',
              },
              {
                title: 'High Fidelity UI',
                desc: 'Smooth animations and responsive designs.',
                iconName: 'Smartphone',
              },
              {
                title: 'Unified Logic',
                desc: 'One codebase for all mobile nodes.',
                iconName: 'Grid',
              },
            ],
            techs: ['React Native', 'Flutter', '.NET MAUI'],
          },
          {
            id: 'ai',
            label: 'AI & Automation',
            title: 'Intelligent Autonomic Agents.',
            iconName: 'Brain',
            gradient: 'from-green-600/20 to-emerald-500/20',
            description:
              'AI chatbots and automation workflows that streamline your business and engage your customers.',
            features: [
              {
                title: 'AI Chatbots',
                desc: 'Natural language support agents.',
                iconName: 'MessageSquare',
              },
              {
                title: 'AI Automation',
                desc: 'Automate repetitive business nodes.',
                iconName: 'Zap',
              },
              {
                title: 'Neural Sync',
                desc: 'Deep integration with your data.',
                iconName: 'Database',
              },
            ],
            techs: ['OpenAI', 'LangChain', 'RAG'],
          },
        ],
        packages: [
          {
            id: 'starter',
            name: 'Starter',
            price: 2999,
            monthlyPrice: 299,
            description:
              'Perfect for landing pages and small business websites.',
            features: [
              'Custom Design',
              'Mobile Responsive',
              'SEO Optimized',
              'CMS Integration',
              '1 Month Support',
            ],
            highlight: false,
            iconName: 'Rocket',
            gradient: 'from-blue-500/20 to-cyan-500/20',
          },
          {
            id: 'growth',
            name: 'Growth',
            price: 5499,
            monthlyPrice: 599,
            description: 'Ideal for growing startups and e-commerce brands.',
            features: [
              'Everything in Starter',
              'Shopping Cart',
              'Payment Gateway',
              'User Authentication',
              '3 Months Support',
              'Analytics Dashboard',
            ],
            highlight: true,
            iconName: 'Sparkles',
            gradient: 'from-purple-500/20 to-pink-500/20',
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            monthlyPrice: 'Custom',
            description: 'Full-scale solution for large organizations.',
            features: [
              'Everything in Growth',
              'Custom API Integration',
              'Cloud Infrastructure',
              'Advanced Security',
              '12 Months Support',
              'Dedicated Project Manager',
            ],
            highlight: false,
            iconName: 'Crown',
            gradient: 'from-orange-500/20 to-red-500/20',
          },
        ],
        process: [
          {
            id: 1,
            title: 'Discovery & Strategy',
            desc: 'We start by understanding your vision, target audience, and technical requirements.',
            iconName: 'Video',
            color: 'text-blue-500',
          },
          {
            id: 2,
            title: 'UX/UI Design',
            desc: 'Our designers create high-fidelity interactive prototypes.',
            iconName: 'FileText',
            color: 'text-purple-500',
          },
          {
            id: 3,
            title: 'Agile Development',
            desc: 'Development happens in 2-week sprints with regular updates.',
            iconName: 'Code2',
            color: 'text-yellow-500',
          },
          {
            id: 4,
            title: 'Quality Assurance',
            desc: 'Rigorous testing across devices and browsers.',
            iconName: 'ClipboardCheck',
            color: 'text-red-500',
          },
          {
            id: 5,
            title: 'Launch & Training',
            desc: 'Seamless deployment with training sessions.',
            iconName: 'Rocket',
            color: 'text-green-500',
          },
          {
            id: 6,
            title: 'Evolution',
            desc: 'Post-launch monitoring and iterative improvements.',
            iconName: 'HeartPulse',
            color: 'text-cyan-500',
          },
        ],
        faqs: [
          {
            id: 'timeline',
            category: 'General',
            question: 'How long does a typical project take?',
            answer:
              'Timeline depends on complexity. A simple website takes 2-4 weeks, while a complex web app can take 2-4 months.',
          },
          {
            id: 'hosting',
            category: 'Technical',
            question: 'Do you provide hosting services?',
            answer:
              'We typically set up hosting for you on platforms like AWS, Vercel, or DigitalOcean. You retain full ownership.',
          },
          {
            id: 'payment',
            category: 'Billing',
            question: 'What is your payment structure?',
            answer:
              'We work on a milestone basis: 40% upfront, 30% after design approval, and 30% upon delivery.',
          },
        ],
        techStack: [
          {
            id: 'frontend',
            label: 'Frontend',
            iconName: 'Layout',
            description: 'Pixel-perfect interfaces',
            techs: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS', 'TypeScript'],
          },
          {
            id: 'backend',
            label: 'Backend',
            iconName: 'Server',
            description: 'Robust scalable logic',
            techs: ['Node.js', 'NestJS', 'Python', 'GoLang', 'GraphQL'],
          },
          {
            id: 'database',
            label: 'Database',
            iconName: 'Database',
            description: 'High-performance storage',
            techs: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase'],
          },
          {
            id: 'cloud',
            label: 'DevOps & Cloud',
            iconName: 'Cloud',
            description: 'CI/CD & Infrastructure',
            techs: ['AWS', 'Vercel', 'Docker', 'Kubernetes'],
          },
        ],
        comparison: {
          features: [
            {
              name: 'Custom Design',
              tooltip: 'Tailored UI/UX specifically for your brand',
            },
            {
              name: 'SEO Optimization',
              tooltip: 'Advanced technical SEO setup',
            },
            { name: 'CMS Integration', tooltip: 'Easy content management' },
            { name: 'E-commerce', tooltip: 'Full shopping cart & checkout' },
            { name: 'API Integration', tooltip: 'Connect 3rd party services' },
            { name: 'Maintenance', tooltip: 'Ongoing support duration' },
          ],
          tiers: [
            {
              id: 'starter',
              name: 'Starter',
              price: '$2,999',
              description: 'Perfect for landing pages.',
              iconName: 'Zap',
              color: 'text-blue-500',
              highlight: false,
            },
            {
              id: 'growth',
              name: 'Growth',
              price: '$5,499',
              description: 'Ideal for growing startups.',
              iconName: 'Sparkles',
              color: 'text-purple-500',
              highlight: true,
            },
            {
              id: 'enterprise',
              name: 'Enterprise',
              price: 'Custom',
              description: 'Full-scale enterprise solution.',
              iconName: 'Crown',
              color: 'text-orange-500',
              highlight: false,
            },
          ],
        },
      },
      blog: {
        hero: {
          title: 'Insights & Articles',
          subtitle: 'Thoughts on development, design, and technology.',
        },
        categories: ['All', 'Development', 'Design', 'AI', 'Business'],
        featured: { enabled: true },
        popularPosts: [],
        newsletter: {
          enabled: true,
          title: 'Subscribe to our newsletter',
          description: 'Get the latest insights delivered to your inbox.',
        },
      },
      portfolio: {
        hero: {
          badge: 'Our Work',
          title: 'Portfolio',
          subtitle: 'Showcasing our best projects and case studies.',
        },
        projects: [],
        categories: ['All', 'Web', 'Mobile', 'AI', 'E-commerce'],
      },
      shop: {
        header: {
          title: 'Shop',
          description: 'Premium digital products and assets.',
        },
        products: [],
        bundles: [],
        testimonials: [],
      },
      terms: {
        header: {
          badge: 'Operational Governance',
          title: 'Terms of Sync.',
          description:
            'Legal framework and architectural governance protocols for the Oftisoft ecosystem.',
          videoUrl: '',
        },
        navigationRail: {
          title: 'Nexus Sections',
          items: [
            'Acceptable Use Node',
            'Sync Obligations',
            'Neural Artifact Licensing',
            'Governance & Jurisdiction',
            'Fiscal Protocol',
          ],
        },
        sections: [
          {
            id: 'access',
            title: 'Platform Architecture Access',
            iconName: 'Globe',
            content:
              'By initiating a sync with Oftisoft, you are granted a revocable, non-exclusive license to utilize our high-fidelity digital artifacts and development nodes.',
          },
          {
            id: 'sovereignty',
            title: 'Neural Logic Sovereignty',
            iconName: 'Scale',
            content:
              'All neural artifacts forged via our private engine remain the intellectual property of the architect (USER).',
          },
        ],
        revision: {
          prefix: 'Last Governance Update:',
          updatedAt: new Date().toLocaleDateString(),
        },
        lastUpdated: new Date().toISOString(),
      },
      support: {
        header: {
          badge: 'Architectural Assistance Hub',
          title: 'Support Universe.',
          searchPlaceholder: 'Find architectural support nodes...',
          videoUrl: '',
        },
        channels: [
          {
            id: 'bot',
            title: 'Neural Chat Bot',
            desc: 'Immediate AI assistance for architectural queries and node status.',
            iconName: 'Bot',
            color: 'text-primary',
          },
          {
            id: 'chat',
            title: 'Direct Sync (Chat)',
            desc: "Join the real-time architect's channel for deep implementation syncs.",
            iconName: 'MessageSquare',
            color: 'text-blue-500',
          },
          {
            id: 'docs',
            title: 'Global SDK Docs',
            desc: 'Exhaustive technical intelligence for independent platform mastery.',
            iconName: 'Terminal',
            color: 'text-purple-500',
          },
        ],
        faq: {
          badge: 'Protocol Intelligence',
          title: 'Frequent Sync Questions',
          items: [
            {
              id: 'sync',
              q: 'How do I initiate a neural sync?',
              a: 'Navigate to the Visual Forge in your dashboard and commit your first node artifact.',
            },
            {
              id: 'latency',
              q: 'What is the global edge latency?',
              a: 'Oftisoft utilizes a proprietary proxy matrix ensuring sub-10ms delivery for document nodes.',
            },
          ],
        },
        priorityRelay: {
          title: 'Priority Relay',
          description:
            'Elite and Enterprise architects can initiate a high-fidelity direct sync with our core engineering operative.',
          buttons: [
            {
              label: 'Initiate Priority Sync',
              iconName: 'Zap',
              variant: 'default',
            },
            { label: 'Email Case Relay', iconName: 'Mail', variant: 'outline' },
          ],
          metrics: [
            {
              id: 'response',
              label: 'Current Response Window',
              value: '~ 8 Minutes',
              iconName: 'Clock',
            },
            {
              id: 'engineers',
              label: 'Active Engineers On-Node',
              value: '12 Members',
              iconName: 'CheckCircle2',
            },
          ],
        },
        lastUpdated: new Date().toISOString(),
      },
      privacy: {
        header: {
          title: 'Privacy Policy',
          description: 'How we protect and handle your data.',
        },
        sections: [],
      },
      settings: {
        heroTitle: 'Oftisoft - Hyper-Scale Growth',
        pathNode: 'home',
        glassmorphism: true,
        motion: true,
        vfx: true,
      },
      global: {
        navbar: {
          brandName: 'Oftisoft',
          links: [
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: 'About', href: '/about' },
            { label: 'Support', href: '/support' },
          ],
        },
        footer: {
          tagline:
            'Architecting the next generation of digital artifacts with high-fidelity engineering.',
          columns: [
            {
              title: 'Ecosystem',
              links: [
                { label: 'Nodes', href: '/services' },
                { label: 'Forge', href: '/forge' },
                { label: 'Nexus', href: '/nexus' },
              ],
            },
            {
              title: 'Governance',
              links: [
                { label: 'Terms', href: '/terms' },
                { label: 'Privacy', href: '/privacy' },
              ],
            },
          ],
        },
      },
      // Home page default content
      home: {
        hero: {
          id: 'hero-1',
          title: 'Future-Ready',
          subtitle: 'Digital Solutions.',
          description:
            'We engineer premium software experiences that redefine industries. Built for performance, scalability, and impact.',
          badge: 'Accepting New Projects',
          primaryCTA: { text: 'Start Project', link: '/#contact' },
          secondaryCTA: { text: 'Showreel', link: '/portfolio' },
          stats: [
            { value: 150, suffix: '+', label: 'Projects Completed' },
            { value: 98, suffix: '%', label: 'Client Satisfaction' },
            { value: 6, suffix: 'Y', label: 'Years Experience' },
          ],
          subtitles: [
            'Digital Solutions.',
            'Web Architecture.',
            'AI Innovation.',
            'SaaS Platforms.',
          ],
          enabled: true,
        },
        services: {
          id: 'services-1',
          title: 'Engineering the',
          subtitle: 'Digital Future',
          badge: 'Capabilities',
          services: [
            {
              id: 'svc-1',
              title: 'Web Development',
              description:
                'Lightning-fast, SEO-optimized web applications built with Next.js, React, and cutting-edge frameworks.',
              icon: 'Globe',
              tags: ['Next.js', 'React', 'TypeScript'],
              gradient: 'from-blue-500 to-cyan-500',
              color: 'text-blue-400',
            },
            {
              id: 'svc-2',
              title: 'Mobile Apps',
              description:
                'Native iOS and Android apps with React Native. Beautiful, performant, and scalable.',
              icon: 'Smartphone',
              tags: ['React Native', 'iOS', 'Android'],
              gradient: 'from-purple-500 to-pink-500',
              color: 'text-purple-400',
            },
            {
              id: 'svc-3',
              title: 'AI Integration',
              description:
                'Leverage GPT-4, Claude, and custom ML models to automate workflows and enhance user experiences.',
              icon: 'Cpu',
              tags: ['OpenAI', 'Machine Learning', 'Automation'],
              gradient: 'from-green-500 to-emerald-500',
              color: 'text-green-400',
            },
            {
              id: 'svc-4',
              title: 'Cloud Infrastructure',
              description:
                'Serverless architectures on AWS, Vercel, and Cloudflare. Auto-scaling, cost-optimized, and secure.',
              icon: 'Cloud',
              tags: ['AWS', 'Serverless', 'DevOps'],
              gradient: 'from-orange-500 to-red-500',
              color: 'text-orange-400',
            },
          ],
          enabled: true,
        },
        projects: {
          id: 'projects-1',
          title: 'Building the',
          subtitle: 'Impossible.',
          badge: 'Selected Work',
          projects: [
            {
              id: 'proj-1',
              title: 'FinTech Dashboard',
              description:
                'Real-time trading platform handling $2B+ daily volume',
              category: 'Finance',
              imageGradient: 'from-blue-600 via-indigo-600 to-violet-600',
              tech: ['Next.js', 'WebSocket', 'Redis'],
              stats: [
                { label: 'Users', value: '50K+' },
                { label: 'Uptime', value: '99.9%' },
              ],
              year: '2025',
            },
            {
              id: 'proj-2',
              title: 'AI Content Studio',
              description:
                'GPT-powered content generation platform for enterprises',
              category: 'AI/ML',
              imageGradient: 'from-purple-600 via-pink-600 to-rose-600',
              tech: ['OpenAI', 'Python', 'FastAPI'],
              stats: [
                { label: 'Generated', value: '1M+ Posts' },
                { label: 'Accuracy', value: '94%' },
              ],
              year: '2025',
            },
            {
              id: 'proj-3',
              title: 'E-Commerce Platform',
              description:
                'Headless commerce solution with AR product previews',
              category: 'E-Commerce',
              imageGradient: 'from-green-600 via-emerald-600 to-teal-600',
              tech: ['Shopify', 'Three.js', 'Stripe'],
              stats: [
                { label: 'Revenue', value: '$5M+' },
                { label: 'Conversion', value: '+45%' },
              ],
              year: '2024',
            },
          ],
          enabled: true,
        },
        whyUs: {
          id: 'whyus-1',
          title: 'Why Visionaries',
          subtitle: 'Choose Us.',
          badge: 'The Oftisoft Edge',
          description:
            'We bridge the gap between creative ambition and technical reality.',
          features: [
            {
              title: 'Top 1% Talent Network',
              description:
                'Access a curated team of elite engineers, designers, and strategists.',
              icon: 'Users',
              color: 'text-blue-500',
              gradient: 'from-blue-500/20 to-blue-600/5',
              stat: '10k+',
              statLabel: 'Dev Hours',
            },
            {
              title: 'Agile Rapid Delivery',
              description:
                'Our streamlined CI/CD pipelines ensure we ship features 2x faster.',
              icon: 'Zap',
              color: 'text-yellow-500',
              gradient: 'from-yellow-500/20 to-orange-600/5',
              stat: '2x',
              statLabel: 'Faster',
            },
            {
              title: 'Enterprise Architecture',
              description:
                'Built for scale from day one. Microservices and serverless that handle millions.',
              icon: 'Cpu',
              color: 'text-purple-500',
              gradient: 'from-purple-500/20 to-indigo-600/5',
              stat: '99.99%',
              statLabel: 'Uptime',
            },
            {
              title: 'Dedicated 24/7 Support',
              description:
                'Our global support team monitors your infrastructure around the clock.',
              icon: 'Shield',
              color: 'text-green-500',
              gradient: 'from-green-500/20 to-emerald-600/5',
              stat: '15min',
              statLabel: 'Response',
            },
          ],
          stats: [
            { value: '98%', label: 'Retention' },
            { value: '150+', label: 'Launches' },
            { value: 'Top 3%', label: 'Global Talent' },
          ],
          enabled: true,
        },
        process: {
          id: 'process-1',
          title: 'From Concept to',
          subtitle: 'Reality.',
          badge: 'How We Work',
          steps: [
            {
              id: 'step-1',
              number: 1,
              title: 'Discovery & Strategy',
              description:
                'We dive deep into your business goals to build a blueprint for success.',
              icon: 'Search',
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              id: 'step-2',
              number: 2,
              title: 'UX/UI Design',
              description:
                'Crafting intuitive, high-fidelity prototypes that convert visitors into customers.',
              icon: 'PenTool',
              gradient: 'from-purple-500 to-pink-500',
            },
            {
              id: 'step-3',
              number: 3,
              title: 'Development Sprint',
              description:
                'Agile development with weekly demos. Real-time progress you can see.',
              icon: 'Code2',
              gradient: 'from-green-500 to-emerald-500',
            },
            {
              id: 'step-4',
              number: 4,
              title: 'Testing & QA',
              description:
                'Rigorous automated and manual testing. We catch bugs before your users do.',
              icon: 'CheckCircle2',
              gradient: 'from-orange-500 to-red-500',
            },
            {
              id: 'step-5',
              number: 5,
              title: 'Launch & Scale',
              description:
                'Smooth deployment with zero downtime. Post-launch monitoring included.',
              icon: 'Rocket',
              gradient: 'from-pink-500 to-rose-500',
            },
            {
              id: 'step-6',
              number: 6,
              title: 'Growth & Support',
              description:
                'Ongoing maintenance and analytics-driven improvements to maximize ROI.',
              icon: 'BarChart3',
              gradient: 'from-cyan-500 to-blue-500',
            },
          ],
          enabled: true,
        },
        testimonials: {
          id: 'testimonials-1',
          title: 'Voices of',
          subtitle: 'Innovation.',
          badge: 'Trusted by Market Leaders',
          testimonials: [
            {
              name: 'Alex Rivera',
              role: 'CTO, FinTech Global',
              avatar: 'https://i.pravatar.cc/150?u=alex',
              quote:
                "Oftisoft's architecture handled our Black Friday traffic without a single hiccup. Absolute engineering mastery.",
              gradient: 'from-blue-500 to-indigo-500',
            },
            {
              name: 'Jessica Chen',
              role: 'Product Lead, Nexus AI',
              avatar: 'https://i.pravatar.cc/150?u=jessica',
              quote:
                "They didn't just build what we asked for. They anticipated what we needed 6 months down the line.",
              gradient: 'from-purple-500 to-pink-500',
            },
            {
              name: 'Marcus Thorne',
              role: 'Founder, Zenith',
              avatar: 'https://i.pravatar.cc/150?u=marcus',
              quote:
                "The level of polish in the UI/UX is unmatched. Best dev agency I've worked with in a decade.",
              gradient: 'from-green-500 to-emerald-500',
            },
            {
              name: 'Sarah Jenkins',
              role: 'Director, Creative Pulse',
              avatar: 'https://i.pravatar.cc/150?u=sarah',
              quote:
                'Incredible attention to detail. The animations and micro-interactions make our app feel alive.',
              gradient: 'from-orange-500 to-amber-500',
            },
            {
              name: 'David Kim',
              role: 'VP Eng, CloudScale',
              avatar: 'https://i.pravatar.cc/150?u=david',
              quote:
                'Scalable, secure, and delivered early. Their DevOps game is strong.',
              gradient: 'from-cyan-500 to-blue-500',
            },
          ],
          enabled: true,
        },
        techStack: {
          id: 'techstack-1',
          title: 'Powered By Modern Tech',
          subtitle: 'Tech Stack',
          badge: 'Powered By Modern Tech',
          technologies: [
            { name: 'Next.js 14', icon: 'Globe', color: 'text-white' },
            { name: 'React', icon: 'Code2', color: 'text-blue-400' },
            { name: 'TypeScript', icon: 'Code2', color: 'text-blue-500' },
            { name: 'Tailwind', icon: 'Layers', color: 'text-cyan-400' },
            { name: 'Framer', icon: 'Zap', color: 'text-pink-500' },
            { name: 'Node.js', icon: 'Server', color: 'text-green-500' },
            { name: 'PostgreSQL', icon: 'Database', color: 'text-blue-300' },
            { name: 'MongoDB', icon: 'Database', color: 'text-green-400' },
            { name: 'Redis', icon: 'Layers', color: 'text-red-500' },
            { name: 'Docker', icon: 'Box', color: 'text-blue-500' },
            { name: 'AWS', icon: 'Cloud', color: 'text-orange-500' },
            { name: 'Rust', icon: 'Terminal', color: 'text-orange-400' },
            { name: 'Python', icon: 'Terminal', color: 'text-yellow-400' },
          ],
          enabled: true,
        },
        cta: {
          id: 'cta-1',
          title: 'Ready to Start Your Project?',
          description: "Let's discuss how we can help you achieve your goals.",
          buttonText: 'Get in Touch',
          buttonLink: '/contact',
          contactInfo: {
            email: 'hello@oftisoft.com',
            phone: '+1 (555) 000-0000',
            location: 'San Francisco, CA',
          },
          enabled: true,
        },
        seo: {
          title: 'Oftisoft - Premium Software Solutions',
          description:
            'Transform your digital vision into reality with modern, high-performance software solutions.',
          keywords: [
            'software development',
            'web development',
            'mobile apps',
            'custom software',
          ],
          ogImage: '/og-image.jpg',
          ogTitle: 'Oftisoft - Premium Software Solutions',
          ogDescription:
            'Transform your digital vision into reality with modern, high-performance software solutions.',
          twitterCard: 'summary_large_image',
          canonicalUrl: 'https://oftisoft.com',
        },
        lastUpdated: new Date().toISOString(),
        status: 'published',
      },
      // Careers page
      careers: {
        hero: {
          badge: 'Join Our Team',
          title: 'Build the Future',
          subtitle: 'With Us.',
          description:
            'We are looking for passionate individuals who want to make an impact.',
        },
        positions: [
          {
            id: 'pos-1',
            title: 'Senior Frontend Engineer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            description:
              'Build beautiful, performant user interfaces with React and Next.js.',
            requirements: [
              '5+ years React experience',
              'TypeScript proficiency',
              'UI/UX sensibility',
            ],
          },
          {
            id: 'pos-2',
            title: 'Backend Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            description: 'Design and implement scalable backend systems.',
            requirements: [
              'Node.js expertise',
              'PostgreSQL experience',
              'API design skills',
            ],
          },
        ],
        benefits: [
          'Competitive salary',
          'Remote work',
          'Health insurance',
          'Learning budget',
        ],
        lastUpdated: new Date().toISOString(),
      },
      // Changelog page
      changelog: {
        title: 'Changelog',
        subtitle: 'Product Updates & New Features',
        entries: [
          {
            id: 'v2.5.0',
            version: '2.5.0',
            date: '2026-01-15',
            title: 'AI Integration Update',
            changes: [
              'Added DeepSeek AI integration for content generation',
              'Improved dashboard performance',
              'Bug fixes and stability improvements',
            ],
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
      // Contact page
      contact: {
        hero: {
          badge: 'Get in Touch',
          title: "Let's Start a",
          subtitle: 'Conversation.',
          description:
            'Have a project in mind? We would love to hear from you.',
        },
        contactInfo: {
          email: 'hello@oftisoft.com',
          phone: '+1 (555) 000-0000',
          address: 'San Francisco, CA',
          hours: 'Mon-Fri 9AM-6PM PST',
        },
        socials: {
          github: 'https://github.com/oftisoft',
          linkedin: 'https://linkedin.com/company/oftisoft',
          twitter: 'https://twitter.com/oftisoft',
        },
        lastUpdated: new Date().toISOString(),
      },
      // Docs page
      docs: {
        title: 'Documentation',
        subtitle: 'Developer Guides & API Reference',
        sections: [
          {
            id: 'getting-started',
            title: 'Getting Started',
            icon: 'Rocket',
            articles: ['Quick Start', 'Installation', 'Configuration'],
          },
          {
            id: 'api-reference',
            title: 'API Reference',
            icon: 'Code',
            articles: ['Authentication', 'Endpoints', 'Errors'],
          },
          {
            id: 'guides',
            title: 'Guides',
            icon: 'Book',
            articles: ['Best Practices', 'Examples', 'Tutorials'],
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
      // Community page
      community: {
        hero: {
          badge: 'Community',
          title: 'Join Our',
          subtitle: 'Developer Community.',
          description:
            'Connect with fellow developers, share ideas, and learn together.',
        },
        features: [
          {
            title: 'Discord Server',
            description: 'Join real-time discussions with our community.',
            icon: 'MessageSquare',
            link: '#',
          },
          {
            title: 'GitHub Discussions',
            description: 'Ask questions and share your projects.',
            icon: 'Github',
            link: '#',
          },
          {
            title: 'Newsletter',
            description: 'Stay updated with our latest content.',
            icon: 'Mail',
            link: '#',
          },
        ],
        stats: [
          { value: '10K+', label: 'Community Members' },
          { value: '500+', label: 'Open Source Stars' },
          { value: '50+', label: 'Contributors' },
        ],
        lastUpdated: new Date().toISOString(),
      },
      // Features page
      features: {
        hero: {
          badge: 'Features',
          title: 'Powerful Features',
          subtitle: 'Built for Modern Teams.',
          description: 'Everything you need to build, scale, and succeed.',
        },
        categories: [
          {
            id: 'dev-tools',
            title: 'Developer Tools',
            features: [
              {
                name: 'API Dashboard',
                description: 'Manage and monitor all your API endpoints.',
              },
              {
                name: 'Real-time Analytics',
                description: 'Track performance metrics in real-time.',
              },
              {
                name: 'Team Collaboration',
                description: 'Work together seamlessly with your team.',
              },
            ],
          },
          {
            id: 'security',
            title: 'Security',
            features: [
              {
                name: 'End-to-End Encryption',
                description: 'Your data is always protected.',
              },
              {
                name: '2FA Authentication',
                description: 'Multi-factor authentication for extra security.',
              },
              {
                name: 'Audit Logs',
                description: 'Complete visibility into all actions.',
              },
            ],
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
      // Integrations page
      integrations: {
        hero: {
          badge: 'Integrations',
          title: 'Seamless',
          subtitle: 'Integrations.',
          description: 'Connect with your favorite tools and services.',
        },
        categories: [
          {
            id: 'payments',
            name: 'Payments',
            integrations: ['Stripe', 'PayPal', 'Square'],
          },
          {
            id: 'analytics',
            name: 'Analytics',
            integrations: ['Google Analytics', 'Mixpanel', 'Amplitude'],
          },
          {
            id: 'communication',
            name: 'Communication',
            integrations: ['Slack', 'Discord', 'Email'],
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
      // Partners page
      partners: {
        hero: {
          badge: 'Partners',
          title: 'Partner With',
          subtitle: 'Oftisoft.',
          description: 'Join our partner program and grow together.',
        },
        types: [
          {
            title: 'Technology Partners',
            description: 'Integrate your products with our platform.',
          },
          {
            title: 'Solution Partners',
            description: 'Deliver solutions to mutual customers.',
          },
          {
            title: 'Reseller Partners',
            description: 'Offer Oftisoft products to your clients.',
          },
        ],
        benefits: [
          'Revenue sharing',
          'Technical support',
          'Marketing resources',
          'Training programs',
        ],
        lastUpdated: new Date().toISOString(),
      },
      // Pricing page
      pricing: {
        hero: {
          badge: 'Pricing',
          title: 'Simple,',
          subtitle: 'Transparent Pricing.',
          description: 'Choose the plan that fits your needs.',
        },
        plans: [
          {
            id: 'starter',
            name: 'Starter',
            price: 0,
            period: 'month',
            description: 'Perfect for getting started.',
            features: ['5 Projects', 'Basic Analytics', 'Email Support'],
            highlighted: false,
          },
          {
            id: 'pro',
            name: 'Pro',
            price: 99,
            period: 'month',
            description: 'For growing teams.',
            features: [
              'Unlimited Projects',
              'Advanced Analytics',
              'Priority Support',
              'API Access',
            ],
            highlighted: true,
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: null,
            period: 'month',
            description: 'For large organizations.',
            features: [
              'Everything in Pro',
              'Custom Integrations',
              'Dedicated Support',
              'SLA',
            ],
            highlighted: false,
          },
        ],
        faq: [],
        lastUpdated: new Date().toISOString(),
      },
      // Status page
      status: {
        title: 'System Status',
        description: 'Real-time status of all Oftisoft services.',
        services: [
          { name: 'API Services', status: 'operational', uptime: '99.99%' },
          { name: 'Dashboard', status: 'operational', uptime: '99.98%' },
          { name: 'Database', status: 'operational', uptime: '99.99%' },
          { name: 'CDN', status: 'operational', uptime: '100%' },
        ],
        incidents: [],
        lastUpdated: new Date().toISOString(),
      },
      // Navbar
      navbar: {
        brandName: 'Oftisoft',
        logo: '/logo.svg',
        links: [
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
          { label: 'About', href: '/about' },
          { label: 'Portfolio', href: '/portfolio' },
          { label: 'Blog', href: '/blog' },
          { label: 'Contact', href: '/contact' },
        ],
        cta: { label: 'Get Started', href: '/contact' },
        lastUpdated: new Date().toISOString(),
      },
      // Footer
      footer: {
        brandName: 'Oftisoft',
        description:
          'Architecting the next generation of digital artifacts with high-fidelity engineering.',
        columns: [
          {
            title: 'Products',
            links: [
              { label: 'Services', href: '/services' },
              { label: 'Portfolio', href: '/portfolio' },
              { label: 'Shop', href: '/shop' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '/about' },
              { label: 'Blog', href: '/blog' },
              { label: 'Careers', href: '/careers' },
            ],
          },
          {
            title: 'Resources',
            links: [
              { label: 'Documentation', href: '/docs' },
              { label: 'Support', href: '/support' },
              { label: 'Status', href: '/status' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
            ],
          },
        ],
        socials: {
          github: 'https://github.com/oftisoft',
          linkedin: 'https://linkedin.com/company/oftisoft',
          twitter: 'https://twitter.com/oftisoft',
        },
        copyright: '© 2026 Oftisoft. All rights reserved.',
        lastUpdated: new Date().toISOString(),
      },
    };

    return defaults[pageKey] || { sections: [] };
  }
}
