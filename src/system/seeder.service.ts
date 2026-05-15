import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Project } from '../entities/project.entity';
import { Category } from '../entities/category.entity';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Portfolio } from '../entities/portfolio.entity';
import * as bcrypt from 'bcrypt';

const bcryptSafe = bcrypt as unknown as {
  hash(password: string, saltRounds: number): Promise<string>;
};

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Portfolio)
    private portfolioRepo: Repository<Portfolio>,
  ) {}

  /**
   * Return a curated list of initial blog posts. These are intended to be
   * â€œrealâ€ entries rather than generic placeholders; the titles and excerpts
   * mimic what an actual editorial calendar might produce. 40 items are
   * generated, each assigned to one of the primary categories.
   */
  private getInitialBlogPosts() {
    const images = {
      web: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1800&auto=format&fit=crop',
      mobile:
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1800&auto=format&fit=crop',
      ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1800&auto=format&fit=crop',
      devops:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1800&auto=format&fit=crop',
      business:
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1800&auto=format&fit=crop',
    };

    const topics = [
      [
        'AI-Ready Web App Architecture: A 2026 Guide for Product Teams',
        'ai',
        'AI-ready web app architecture',
      ],
      [
        'Next.js 16.2 Performance Playbook for Faster Production Apps',
        'web',
        'Next.js 16.2 performance',
      ],
      [
        'SEO for AI Search and Answer Engines: What Still Works in 2026',
        'business',
        'SEO for AI search',
      ],
      [
        'React Server Components: The Business Guide for Faster UX',
        'web',
        'React Server Components business guide',
      ],
      [
        'Headless CMS Content Operations for Growing SaaS Teams',
        'business',
        'headless CMS content operations',
      ],
      [
        'Progressive Web Apps for Ecommerce: Speed, Retention, and ROI',
        'mobile',
        'Progressive Web Apps for ecommerce',
      ],
      [
        'Edge Computing for SaaS: Where It Helps and Where It Does Not',
        'devops',
        'edge computing for SaaS',
      ],
      [
        'Design Systems That Ship Faster: Tokens, Components, and Governance',
        'web',
        'design systems that ship faster',
      ],
      [
        'Technical SEO Checklist for Next.js Websites in 2026',
        'web',
        'technical SEO checklist for Next.js',
      ],
      [
        'How to Build an AI Chatbot for Customer Support Without Losing Trust',
        'ai',
        'AI chatbot for customer support',
      ],
      [
        'Database Indexing for Node.js Apps: A Practical Speed Guide',
        'devops',
        'database indexing for Node.js apps',
      ],
      [
        'SaaS Pricing Page Conversion Guide: Clarity Beats Cleverness',
        'business',
        'SaaS pricing page conversion',
      ],
      [
        'Mobile-First Dashboard Design for Busy Business Users',
        'mobile',
        'mobile-first dashboard design',
      ],
      [
        'Secure Authentication for MERN Stack Apps: Sessions, JWTs, and 2FA',
        'devops',
        'secure authentication for MERN stack',
      ],
      [
        'Marketing Automation for Service Businesses: Leads to Revenue',
        'business',
        'marketing automation for service businesses',
      ],
      [
        'AI Code Review Workflow: Faster Feedback Without Lower Standards',
        'ai',
        'AI code review workflow',
      ],
      [
        'Core Web Vitals Optimization Plan for Revenue-Focused Websites',
        'web',
        'Core Web Vitals optimization plan',
      ],
      [
        'Custom CRM Development Guide for Teams Outgrowing Spreadsheets',
        'business',
        'custom CRM development',
      ],
      [
        'API-First Product Development: Build Once, Reuse Everywhere',
        'devops',
        'API-first product development',
      ],
      [
        'Landing Page Copywriting for Software Products: From Click to Demo',
        'business',
        'landing page copywriting for software',
      ],
      [
        'Cloud Cost Optimization for Node.js Apps Without Slowing Growth',
        'devops',
        'cloud cost optimization for Node.js',
      ],
      [
        'Local SEO for Software Agencies: Win Better Regional Clients',
        'business',
        'local SEO for software agencies',
      ],
      [
        'Flutter vs React Native in 2026: Choosing for Product Reality',
        'mobile',
        'Flutter vs React Native 2026',
      ],
      [
        'How to Write an AI Product Requirements Document',
        'ai',
        'AI product requirements document',
      ],
      [
        'Conversion Rate Optimization for SaaS Homepages',
        'business',
        'conversion rate optimization for SaaS homepages',
      ],
      [
        'Zero-Downtime Deployment Guide for Modern Web Apps',
        'devops',
        'zero-downtime deployment guide',
      ],
      [
        'Web Accessibility Checklist for Startups Shipping Fast',
        'web',
        'web accessibility checklist for startups',
      ],
      [
        'Microservices vs Modular Monolith: Choose the Right Backend Shape',
        'devops',
        'microservices vs modular monolith',
      ],
      [
        'AI Content Workflow for SEO Teams That Protects Quality',
        'ai',
        'AI content workflow for SEO teams',
      ],
      [
        'Secure File Upload System Design for Web Applications',
        'devops',
        'secure file upload system',
      ],
      [
        'Analytics Dashboard KPI Design: From Data Noise to Decisions',
        'web',
        'analytics dashboard KPI design',
      ],
      [
        'B2B Website Redesign Checklist: Strategy Before Visual Polish',
        'business',
        'B2B website redesign checklist',
      ],
      [
        'Payment Integration Best Practices for SaaS and Marketplaces',
        'devops',
        'payment integration best practices',
      ],
      [
        'AI Personalization for Ecommerce: Useful Recommendations Without Creepiness',
        'ai',
        'AI personalization for ecommerce',
      ],
      [
        'Content Calendar for Tech Companies: Plan Topics That Compound',
        'business',
        'content calendar for tech companies',
      ],
      [
        'TypeScript for Large React Apps: Patterns That Keep Teams Moving',
        'web',
        'TypeScript for large React apps',
      ],
      [
        'Push Notification Strategy for Mobile Apps: Helpful, Timely, Respectful',
        'mobile',
        'push notification strategy for mobile apps',
      ],
      [
        'Observability for Startups: Logs, Metrics, Traces, and Sanity',
        'devops',
        'observability for startups',
      ],
      [
        'Website Maintenance Plan: Security, Speed, SEO, and Content Freshness',
        'business',
        'website maintenance plan',
      ],
      [
        'App Store Optimization for Startups: Metadata, Screenshots, and Reviews',
        'mobile',
        'app store optimization for startups',
      ],
      [
        'AI Data Privacy for SaaS Products: Practical Guardrails',
        'ai',
        'AI data privacy for SaaS',
      ],
      [
        'Portfolio Case Study Template for Software Agencies',
        'business',
        'portfolio case study template',
      ],
      [
        'Serverless vs Containers: Picking the Right Deployment Model',
        'devops',
        'serverless vs containers',
      ],
      [
        'Ecommerce Search UX: Help Shoppers Find and Decide Faster',
        'web',
        'ecommerce search UX',
      ],
      [
        'Software Project Discovery Workshop: What to Decide Before Development',
        'business',
        'software project discovery workshop',
      ],
      [
        'AI Agent Workflows for Business: Where Automation Actually Pays Off',
        'ai',
        'AI agent workflows for business',
      ],
    ];

    return topics.map(([title, category, keyword], index) => {
      const i = index + 1;
      const day = i <= 22 ? 23 - i : 52 - i;
      const month = i <= 22 ? 'Apr' : 'Mar';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      return {
        id: `post-${String(i).padStart(3, '0')}`,
        slug,
        title,
        excerpt: `A practical Oftisoft guide to ${keyword}, written for teams that want modern software, stronger SEO, and measurable growth.`,
        content: `
                    <h2>${title}</h2>
                    <p><strong>Primary keyword:</strong> ${keyword}. This original Oftisoft article explains how to make the topic useful for real projects, real customers, and real business outcomes.</p>
                    <p>The best digital teams in 2026 are not chasing every trend. They are choosing focused improvements that make products faster, clearer, safer, and easier to grow.</p>
                    <h2>Why ${keyword} matters</h2>
                    <p>${keyword} affects how people discover, trust, use, and buy from a digital product. A good plan connects the technical decision to customer experience, operational reliability, and revenue impact.</p>
                    <h2>Oftisoft implementation framework</h2>
                    <h3>1. Start with the user problem</h3>
                    <p>Define the job the user is trying to complete and remove friction before adding complexity.</p>
                    <h3>2. Build the smallest reliable version</h3>
                    <p>Use proven patterns, clear ownership, useful analytics, and simple rollback paths so every release can be improved safely.</p>
                    <h3>3. Measure what changed</h3>
                    <p>Track speed, conversion, search visibility, retention, support load, and customer satisfaction. Improvement should be visible in behavior, not only in internal dashboards.</p>
                    <h2>Checklist</h2>
                    <ul>
                        <li>Document the business goal and primary audience.</li>
                        <li>Choose the simplest architecture that can support the next stage of growth.</li>
                        <li>Add SEO metadata, structured headings, internal links, and helpful examples.</li>
                        <li>Review performance, security, accessibility, and analytics before publishing.</li>
                    </ul>
                    <h2>FAQ</h2>
                    <h3>How often should this be updated?</h3>
                    <p>Review important pages and workflows every quarter, and refresh them after major product, framework, or market changes.</p>
                    <h3>Can Oftisoft help with this?</h3>
                    <p>Yes. Oftisoft plans, designs, builds, optimizes, and maintains web apps, mobile apps, AI features, ecommerce systems, dashboards, and SEO-ready marketing websites.</p>
                `,
        coverImage: images[category as keyof typeof images],
        category,
        authorId:
          i % 4 === 0
            ? 'auth-2'
            : i % 3 === 0
              ? 'auth-4'
              : i % 2 === 0
                ? 'auth-3'
                : 'auth-1',
        date: `${month} ${String(day).padStart(2, '0')}, 2026`,
        readTime: `${7 + (i % 6)} min read`,
        views: `${6 + i}.${i % 10}k`,
        featured: i <= 4,
        popularResult: i >= 3 && i <= 12,
        popularRank: i >= 3 && i <= 12 ? String(i - 2).padStart(2, '0') : null,
        status: 'published',
        gradient: [
          'from-blue-600 to-violet-600',
          'from-cyan-600 to-blue-700',
          'from-orange-500 to-rose-600',
          'from-emerald-600 to-teal-700',
        ][index % 4],
      };
    });
  }

  async seed() {
    this.logger.log('Initiating Architectural Data Seed...');

    await this.seedUsers();
    await this.seedCategories();
    await this.seedProducts();
    await this.seedProjects();
    await this.seedConversations();

    await this.seedSubscriptionPlans();
    await this.seedPortfolio();

    this.logger.log('Database Synthesis Complete.');
  }

  private async seedSubscriptionPlans() {
    const plans = [
      {
        name: 'Starter',
        price: 29,
        interval: 'month',
        description: 'Best for one-page sites or a small content refresh.',
        features: [
          'Homepage rewrite',
          'SEO title and description',
          'One content revision',
          'Basic image text guidance',
          'Email support',
        ],
        buttonText: 'Choose Starter',
        iconName: 'Zap',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        activeSubscribers: 0,
        isActive: true,
      },
      {
        name: 'Growth',
        price: 99,
        interval: 'month',
        description: 'Best for multi-page sites and blog-ready content systems.',
        features: [
          'Full marketing page set',
          'Blog structure and SEO fields',
          'Image text descriptions',
          'Priority revision round',
          'Content planning support',
          'Launch checklist',
        ],
        buttonText: 'Choose Growth',
        iconName: 'Sparkles',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        activeSubscribers: 0,
        isActive: true,
      },
      {
        name: 'Custom',
        price: 299,
        interval: 'month',
        description:
          'Best for teams that want a full content and website rollout.',
        features: [
          'Complete website rewrite',
          'Custom page architecture',
          'SEO and content audit',
          'Ongoing update support',
          'Priority communication',
          'Long-term content roadmap',
        ],
        buttonText: 'Request Quote',
        iconName: 'Crown',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        activeSubscribers: 0,
        isActive: true,
      },
    ];

    for (const plan of plans) {
      const existing = await this.subscriptionPlanRepo.findOne({
        where: { name: plan.name },
      });
      if (!existing) {
        await this.subscriptionPlanRepo.save(
          this.subscriptionPlanRepo.create(plan),
        );
      }
    }
    this.logger.log('Subscription Plans: Seeded');
  }

  private async seedPortfolio() {
    const admin = await this.userRepo.findOne({ where: { role: 'Admin' } });

    const items = [
      {
        title: 'EcoSmart E-commerce',
        slug: 'ecosmart-ecommerce',
        category: 'Ecommerce',
        client: 'EcoLife Inc.',
        description: 'A sustainable fashion marketplace with real-time inventory.',
        longDescription: 'EcoSmart is a pioneering e-commerce platform dedicated to sustainable fashion. We engineered a real-time inventory system using Redis and developed a personalized recommendation engine that increased conversion rates by 40%.',
        image: 'https://images.unsplash.com/photo-1523474253062-5e4ead0d166d?q=80&w=800&auto=format&fit=crop',
        tags: ['Next.js', 'Stripe', 'Tailwind', 'Redis'],
        gradient: 'from-emerald-500/20 to-teal-500/20',
        stats: JSON.stringify([{ label: 'ROI', value: '250%' }, { label: 'Sales', value: '$2M+' }]),
        featured: true,
        status: 'published',
        order: 1,
        userId: admin?.id,
      },
      {
        title: 'FinTech Analytics Core',
        slug: 'fintech-analytics-core',
        category: 'Enterprise',
        client: 'FinanceFlow',
        description: 'High-performance dashboard processing millions of transactions.',
        longDescription: 'Built for high-frequency trading firms, this dashboard visualizes millions of data points in real-time without rendering lag. Utilizes WebWorkers and canvas-based rendering for maximum performance.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
        tags: ['React', 'D3.js', 'Node.js', 'GraphQL'],
        gradient: 'from-blue-600/20 to-indigo-600/20',
        stats: JSON.stringify([{ label: 'Latency', value: '<50ms' }, { label: 'Users', value: '50k' }]),
        featured: true,
        status: 'published',
        order: 2,
        userId: admin?.id,
      },
      {
        title: 'Nexus AI Assistant',
        slug: 'nexus-ai-assistant',
        category: 'AI',
        client: 'TechHelp',
        description: 'Customer service automation handling 80% of inquiries.',
        longDescription: 'A context-aware AI agent that integrates with existing helpdesk categories. It uses RAG (Retrieval Augmented Generation) to provide accurate answers based on company knowledge bases.',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
        tags: ['Python', 'LangChain', 'FastAPI', 'Pinecone'],
        gradient: 'from-purple-600/20 to-pink-600/20',
        stats: JSON.stringify([{ label: 'Automation', value: '80%' }, { label: 'Cost Saving', value: '40%' }]),
        featured: true,
        status: 'published',
        order: 3,
        userId: admin?.id,
      },
      {
        title: 'Nomad Travel App',
        slug: 'nomad-travel-app',
        category: 'Mobile',
        client: 'GoTravel',
        description: 'Cross-platform mobile app for offline travel planning.',
        longDescription: 'Designed for digital nomads, this app features robust offline-first architecture. Syncs data automatically when connection is restored, ensuring seamless travel planning in remote areas.',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
        tags: ['React Native', 'Firebase', 'Google Maps'],
        gradient: 'from-orange-500/20 to-yellow-500/20',
        stats: JSON.stringify([{ label: 'Downloads', value: '100k+' }, { label: 'Rating', value: '4.8' }]),
        featured: false,
        status: 'published',
        order: 4,
        userId: admin?.id,
      },
      {
        title: 'MediCare Portal',
        slug: 'healthcare-portal',
        category: 'Enterprise',
        client: 'MediCare',
        description: 'Secure patient management system for hospital networks.',
        longDescription: 'A HIPAA-compliant platform connecting patients with doctors. Features end-to-end encryption for all medical records and a highly accessible UI for elderly patients.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
        tags: ['Next.js', 'PostgreSQL', 'HIPAA', 'Docker'],
        gradient: 'from-cyan-500/20 to-blue-500/20',
        stats: JSON.stringify([{ label: 'Efficiency', value: '+45%' }, { label: 'Security', value: '100%' }]),
        featured: false,
        status: 'published',
        order: 5,
        userId: admin?.id,
      },
      {
        title: 'Chronos Luxury',
        slug: 'chronos-luxury',
        category: 'Web',
        client: 'Chronos',
        description: 'Award-winning immersive 3D website for luxury watches.',
        longDescription: 'To capturing the craftsmanship of luxury timepieces, we built a fully 3D interactive product showcase using Three.js and WebGL. The result is a showroom experience in the browser.',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
        tags: ['GSAP', 'Three.js', 'WebGL', 'Blender'],
        gradient: 'from-amber-600/20 to-red-600/20',
        stats: JSON.stringify([{ label: 'Traffic', value: '500k' }, { label: 'Awards', value: '3' }]),
        featured: false,
        status: 'published',
        order: 6,
        userId: admin?.id,
      },
    ];

    for (const item of items) {
      const existing = await this.portfolioRepo.findOne({
        where: { slug: item.slug },
      });
      if (!existing) {
        await this.portfolioRepo.save(
          this.portfolioRepo.create(item),
        );
      }
    }
    this.logger.log('Portfolio Items: Seeded');
  }

  async shouldRunSeed(): Promise<boolean> {
    const [userCount, categoryCount, productCount, projectCount] =
      await Promise.all([
        this.userRepo.count(),
        this.categoryRepo.count(),
        this.productRepo.count(),
        this.projectRepo.count(),
      ]);

    return (
      userCount === 0 &&
      categoryCount === 0 &&
      productCount === 0 &&
      projectCount === 0
    );
  }

  private async seedUsers() {
    const adminEmail = 'rasel@oftisoft.com';
    const botEmail = 'sarah@oftisoft.com';

    // Founder / Admin â€“ Rasel Hossain
    const existingAdmin = await this.userRepo.findOne({
      where: { email: adminEmail },
    });
    if (!existingAdmin) {
      const hashedPassword = await bcryptSafe.hash('ofti_architect_2026', 10);
      const admin = this.userRepo.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Rasel Hossain',
        role: 'Admin',
        jobTitle: 'Founder & Chief Architect',
        bio: 'Passionate software engineer with 6+ years of professional experience building highâ€‘fidelity digital artifacts. Fullâ€‘stack specialist â€“ I can build anything from complex web platforms to AIâ€‘driven mobile apps and cloud infrastructure.',
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
        isActive: true,
        isEmailVerified: true,
      });
      await this.userRepo.save(admin);
      this.logger.log('Admin Node Protocol: Synced');
    }

    // Super Admin
    const superAdminEmail = 'raselhossain86666@gmail.com';
    const existingSuperAdmin = await this.userRepo.findOne({
      where: { email: superAdminEmail },
    });
    if (!existingSuperAdmin) {
      const hashedPassword = await bcryptSafe.hash('Admin123@@', 10);
      const superAdmin = this.userRepo.create({
        email: superAdminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'Admin',
        jobTitle: 'Super Administrator',
        bio: 'The root of all access.',
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&auto=format&fit=crop',
        isActive: true,
        isEmailVerified: true,
      });
      await this.userRepo.save(superAdmin);
      this.logger.log('Super Admin Node Protocol: Synced');
    }

    // Support Bot â€“ Sarah
    const existingBot = await this.userRepo.findOne({
      where: { email: botEmail },
    });
    if (!existingBot) {
      const bot = this.userRepo.create({
        email: botEmail,
        name: 'Sarah â€“ Oftisoft Support',
        role: 'Support',
        jobTitle: 'Senior Support Architect',
        bio: 'Professional AI architectural support agent.',
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
        isAI: true,
        isActive: true,
      });
      await this.userRepo.save(bot);
      this.logger.log('Support Agent Instance: Booted');
    }
  }

  private async seedCategories() {
    const categories = [
      {
        name: 'Web Architecture',
        slug: 'web',
        description:
          'Highâ€‘performance web platforms and fullâ€‘stack solutions.',
        subcategories: [
          'WordPress',
          'Next.js',
          'React',
          'Headless CMS',
          'Eâ€‘commerce',
        ],
      },
      {
        name: 'Mobile Node',
        slug: 'mobile',
        description: 'Enterpriseâ€‘grade crossâ€‘platform mobile applications.',
        subcategories: [
          'MAUI',
          'React Native',
          'Flutter',
          'iOS Native',
          'Android Native',
        ],
      },
      {
        name: 'AI & Neural',
        slug: 'ai',
        description: 'Intelligent automation and neural chatbot agents.',
        subcategories: ['NLP', 'RAG Systems', 'Automation Bots', 'Neural Sync'],
      },
      {
        name: 'DevOps & Cloud',
        slug: 'devops',
        description: 'Scaling infrastructure and automated deployment nodes.',
        subcategories: [
          'AWS',
          'Azure',
          'Kubernetes',
          'CI/CD',
          'Security Audits',
        ],
      },
    ];

    for (const cat of categories) {
      const existing = await this.categoryRepo.findOne({
        where: { slug: cat.slug },
      });
      if (!existing) {
        await this.categoryRepo.save(this.categoryRepo.create(cat));
      }
    }
  }

  private async seedProducts() {
    const products = [
      {
        name: 'Premium WordPress Ecosystem',
        slug: 'premium-wordpress',
        description:
          'A hyperâ€‘scale WordPress architecture with customâ€‘forged themes and headless CMS capability. Engineered for maximum engagement and connection.',
        price: 1499,
        category: 'web',
        subcategory: 'WordPress',
        image:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
        tags: ['Elite', 'Highâ€‘Fidelity', 'Scalable'],
        features: ['Custom Visual Forge', 'Neural SEO Node', 'Edge Optimized'],
        version: 'v6.2.0',
        updatePolicy: 'Lifetime Architectural Updates',
        licenseRegular: 1499,
        licenseExtended: 4999,
        compatibility: ['PHP 8.2+', 'MySQL 8.0'],
        rating: 4.9,
        reviews: 124,
        screenshots: [],
      },
      {
        name: 'Crossâ€‘Platform Mobile Node',
        slug: 'mobile-node-maui',
        description:
          'Enterprise MAUI/Fullâ€‘Stack mobile application framework. Sync your logic across iOS, Android, and Windows with subâ€‘millisecond latency.',
        price: 2499,
        category: 'mobile',
        subcategory: 'MAUI',
        image:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
        tags: ['Crossâ€‘Platform', 'Enterprise', 'Native Performance'],
        features: [
          'Unified Logic Core',
          'Premium UI Kit',
          'Social Node Integration',
        ],
        version: 'v2.11.0',
        updatePolicy: 'Annual Maintenance Sync',
        licenseRegular: 2499,
        licenseExtended: 8999,
        compatibility: ['.NET 8.0', 'Visual Studio 2022'],
        rating: 4.8,
        reviews: 86,
        screenshots: [],
      },
      {
        name: 'Neural AI Support Agent',
        slug: 'neural-ai-agent',
        description:
          'Advanced autonomous support agent utilizing RAG and neuralâ€‘sync technology. Capable of handling 90% of architectural queries in realâ€‘time.',
        price: 3499,
        category: 'ai',
        subcategory: 'Automation',
        image:
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
        tags: ['AIâ€‘Driven', 'Autonomic', 'RAGâ€‘Sync'],
        features: [
          'Natural Language Core',
          'Legacy Data Sync',
          'Selfâ€‘Learning Protocol',
        ],
        version: 'v1.4.2',
        updatePolicy: 'Monthly Neural Training Sessions',
        licenseRegular: 3499,
        licenseExtended: 12500,
        compatibility: ['Python 3.11', 'OpenAI API Node'],
        rating: 5.0,
        reviews: 42,
        screenshots: [],
      },
      {
        name: 'Edge Architecture Security',
        slug: 'edge-security-shield',
        description:
          'Hyperâ€‘secure firewall and audit node for enterprise cloud deployments. Verifies every logicâ€‘bit before execution.',
        price: 5999,
        category: 'devops',
        subcategory: 'Security',
        image:
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
        tags: ['Zeroâ€‘Trust', 'Auditâ€‘Verified', 'Edgeâ€‘Native'],
        features: [
          'Realâ€‘time Pulse Monitoring',
          'Automated Breachâ€‘Seal',
          'Quantum Encryption Node',
        ],
        version: 'v4.0.1',
        updatePolicy: '24/7 Architectural Oversight',
        licenseRegular: 5999,
        licenseExtended: 19999,
        compatibility: ['Kubernetes', 'AWS', 'Azure'],
        rating: 4.9,
        reviews: 28,
        screenshots: [],
      },
    ];

    for (const prod of products) {
      const existing = await this.productRepo.findOne({
        where: { slug: prod.slug },
      });

      if (existing) {
        Object.assign(existing, prod);
        await this.productRepo.save(existing);
      } else {
        await this.productRepo.save(this.productRepo.create(prod));
      }
    }
    this.logger.log('Service Matrix: Populated');
  }

  private async seedProjects() {
    const admin = await this.userRepo.findOne({ where: { role: 'Admin' } });
    if (!admin) return;

    const projects = [
      {
        title: 'Oftisoft Global Rebuild',
        description:
          'Internal architectural rebuild of the main software ecosystem using NestJS and Next.js 14. Synchronizing 24+ global nodes.',
        client: 'Oftisoft Internal',
        status: 'Completed',
        progress: 100,
        budget: 25000,
        paymentStatus: 'Paid',
        userId: admin.id,
        tags: ['Internal', 'Hyperâ€‘Scale', 'NestJS'],
      },
      {
        title: 'Fintech Shield Dashboard',
        description:
          'A highâ€‘fidelity trading dashboard for an asset management firm, featuring realâ€‘time neural market analysis.',
        client: 'Vanguard Alpha',
        status: 'Completed',
        progress: 100,
        budget: 65000,
        paymentStatus: 'Paid',
        userId: admin.id,
        tags: ['Fintech', 'Realâ€‘time', 'Next.js'],
      },
      {
        title: 'Neural CRM Implementation',
        description:
          'AIâ€‘driven client relationship management hub for an enterprise logistics client, integrating 150+ API nodes.',
        client: 'Global Logistics Corp',
        status: 'In Progress',
        progress: 65,
        budget: 45000,
        paymentStatus: 'Partial',
        userId: admin.id,
        tags: ['AI', 'Enterprise', 'MAUI'],
      },
      {
        title: 'Eâ€‘commerce Hyperâ€‘Grid',
        description:
          'Scaling a fragmented eâ€‘commerce setup into a unified headless architecture capable of 1M+ transactions per node.',
        client: 'Zenith Retail',
        status: 'Planning',
        progress: 15,
        budget: 120000,
        paymentStatus: 'Pending',
        userId: admin.id,
        tags: ['Eâ€‘commerce', 'Headless', 'Big Data'],
      },
      // Additional impressive projects
      {
        title: 'MedAI Telehealth Platform',
        description:
          'A secure, HIPAAâ€‘compliant telehealth platform with AIâ€‘powered symptom checker and realâ€‘time video consultations.',
        client: 'HealthNet International',
        status: 'Completed',
        progress: 100,
        budget: 180000,
        paymentStatus: 'Paid',
        userId: admin.id,
        tags: ['Healthcare', 'AI', 'React Native'],
      },
      {
        title: 'Luxury Automotive Configurator',
        description:
          'Immersive 3D car configurator using WebGL and Three.js, allowing customers to customize every detail in real time.',
        client: 'Prestige Motors',
        status: 'Completed',
        progress: 100,
        budget: 95000,
        paymentStatus: 'Paid',
        userId: admin.id,
        tags: ['3D', 'WebGL', 'Next.js'],
      },
      {
        title: 'Global Supply Chain Optimizer',
        description:
          'Machine learning platform that predicts demand and optimizes inventory across 200+ warehouses worldwide.',
        client: 'LogiChain Solutions',
        status: 'In Progress',
        progress: 80,
        budget: 250000,
        paymentStatus: 'Partial',
        userId: admin.id,
        tags: ['ML', 'Python', 'AWS'],
      },
    ];

    for (const proj of projects) {
      const existing = await this.projectRepo.findOne({
        where: { title: proj.title },
      });

      if (existing) {
        Object.assign(existing, proj);
        await this.projectRepo.save(existing);
      } else {
        await this.projectRepo.save(this.projectRepo.create(proj));
      }
    }
    this.logger.log('Portfolio Nodes: Initialized');
  }

  private async seedConversations() {
    const adminEmail = 'rasel@oftisoft.com';
    const botEmail = 'sarah@oftisoft.com';

    const admin = await this.userRepo.findOne({ where: { email: adminEmail } });
    const bot = await this.userRepo.findOne({ where: { email: botEmail } });

    if (!admin || !bot) return;

    try {
      const existingConv = await this.conversationRepo
        .createQueryBuilder('conversation')
        .innerJoin('conversation.participants', 'p1')
        .innerJoin('conversation.participants', 'p2')
        .where('p1.id = :adminId', { adminId: admin.id })
        .andWhere('p2.id = :botId', { botId: bot.id })
        .getOne();

      if (!existingConv) {
        const conversation = this.conversationRepo.create({
          participants: [admin, bot],
          type: 'direct',
          name: 'Sarah â€“ Oftisoft Support',
        });
        const savedConv = await this.conversationRepo.save(conversation);

        const message = this.messageRepo.create({
          content:
            'Welcome to Oftisoft, Chief Architect! I am Sarah, your dedicated support node. How can I assist you in forging your next digital masterpiece today?',
          sender: bot,
          conversation: savedConv,
          read: false,
        });
        await this.messageRepo.save(message);

        this.logger.log('Nexus Communication Node: Initialized');
      }
    } catch (error) {
      this.logger.warn(
        `Conversation seed skipped due to schema mismatch: ${(error as Error).message}`,
      );
    }
  }
}
