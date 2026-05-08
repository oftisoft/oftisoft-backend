import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageContent } from '../entities/page-content.entity';

@Injectable()
export class BlogSeederService {
  private readonly logger = new Logger(BlogSeederService.name);

  constructor(
    @InjectRepository(PageContent)
    private pageContentRepo: Repository<PageContent>,
  ) {}

  public getComprehensiveBlogPosts() {
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
                    <p><strong>Primary keyword:</strong> ${keyword}. This original Oftisoft article is designed for business owners, founders, and engineering teams who want practical digital growth without vague theory.</p>
                    <p>Modern software succeeds when technical decisions support a clear user journey. The right approach improves performance, trust, search visibility, conversion, and long-term maintainability.</p>
                    <h2>Why ${keyword} matters in 2026</h2>
                    <p>Customers expect fast pages, reliable workflows, useful content, and secure experiences. Search systems reward helpful expertise. Product teams need architecture that can change without expensive rewrites.</p>
                    <h2>Oftisoft framework</h2>
                    <h3>1. Define the measurable outcome</h3>
                    <p>Start with a business result such as more qualified leads, faster checkout, lower support load, better retention, or cleaner operations.</p>
                    <h3>2. Build the smallest reliable version</h3>
                    <p>Use proven technology, clear ownership, useful analytics, and release paths that make rollback simple.</p>
                    <h3>3. Optimize after real usage</h3>
                    <p>Review real user data, conversion behavior, Core Web Vitals, search performance, and customer feedback before adding complexity.</p>
                    <h2>SEO and launch checklist</h2>
                    <ul>
                        <li>Use a focused title, meta description, and helpful headings.</li>
                        <li>Add original examples, internal links, image alt text, and clear CTAs.</li>
                        <li>Check performance, accessibility, security, and mobile layout.</li>
                        <li>Refresh the article when product, market, or framework details change.</li>
                    </ul>
                    <h2>FAQ</h2>
                    <h3>Is this only for large teams?</h3>
                    <p>No. Small teams benefit when the plan is clear, the scope is focused, and every feature has a measurable reason.</p>
                    <h3>How can Oftisoft help?</h3>
                    <p>Oftisoft builds web apps, mobile apps, AI features, ecommerce systems, dashboards, automation workflows, and SEO-ready marketing sites for growing businesses.</p>
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

  private getBlogPageContent() {
    return {
      hero: {
        title: 'Oftisoft Insights',
        subtitle:
          'Original, practical guides on web development, AI, mobile apps, DevOps, SEO, and digital growth.',
      },
      categories: [
        { id: 'all', label: 'All View', slug: 'all', icon: 'Grid' },
        { id: 'web', label: 'Engineering', slug: 'engineering', icon: 'Code' },
        { id: 'mobile', label: 'Mobile', slug: 'mobile', icon: 'Smartphone' },
        { id: 'ai', label: 'AI & Data', slug: 'ai-data', icon: 'Brain' },
        { id: 'devops', label: 'DevOps', slug: 'devops', icon: 'Cloud' },
        { id: 'business', label: 'Growth', slug: 'growth', icon: 'Briefcase' },
      ],
      authors: [
        {
          id: 'auth-1',
          name: 'Rasel Hossain',
          role: 'Software Engineer',
          avatar: '',
          initials: 'RH',
          bio: 'Founder-minded software engineer helping startups and businesses build practical web apps, AI features, dashboards, and scalable digital systems.',
          stats: [
            { label: 'Articles', value: '40+' },
            { label: 'Focus', value: 'AI + Web' },
            { label: 'Projects', value: '100+' },
          ],
          tags: ['Architecture', 'AI', 'MERN Stack'],
          socials: { twitter: '#', linkedin: '#', github: '#' },
        },
        {
          id: 'auth-2',
          name: 'Nadia Karim',
          role: 'Product Designer',
          avatar: '',
          initials: 'NK',
          bio: 'Design strategist focused on accessible interfaces, conversion-ready journeys, mobile UX, and scalable design systems.',
          stats: [
            { label: 'Articles', value: '12+' },
            { label: 'Specialty', value: 'UX' },
            { label: 'Audits', value: '80+' },
          ],
          tags: ['UI/UX', 'Accessibility', 'Design Systems'],
          socials: { twitter: '#', linkedin: '#', website: '#' },
        },
        {
          id: 'auth-3',
          name: 'David Chen',
          role: 'Cloud Architect',
          avatar: '',
          initials: 'DC',
          bio: 'Cloud and backend architect specializing in secure APIs, reliable deployments, database performance, and cost-aware infrastructure.',
          stats: [
            { label: 'Articles', value: '15+' },
            { label: 'Uptime', value: '99.9%' },
            { label: 'Systems', value: '70+' },
          ],
          tags: ['Backend', 'Cloud', 'DevOps'],
          socials: { github: '#', linkedin: '#', website: '#' },
        },
        {
          id: 'auth-4',
          name: 'Maya Rahman',
          role: 'Growth Strategist',
          avatar: '',
          initials: 'MR',
          bio: 'SEO and growth strategist helping technical companies turn websites, content, analytics, and automation into qualified demand.',
          stats: [
            { label: 'Articles', value: '18+' },
            { label: 'Focus', value: 'SEO' },
            { label: 'Campaigns', value: '60+' },
          ],
          tags: ['SEO', 'Content', 'Conversion'],
          socials: { twitter: '#', linkedin: '#', website: '#' },
        },
      ],
      posts: this.getComprehensiveBlogPosts(),
      lastUpdated: new Date().toISOString(),
    };
  }

  async seedBlogPosts() {
    const content = this.getBlogPageContent();
    const existing = await this.pageContentRepo.findOne({
      where: { pageKey: 'blog' },
    });

    if (existing) {
      existing.content = content;
      existing.status = 'published';
      existing.publishedAt = new Date();
      await this.pageContentRepo.save(existing);
    } else {
      await this.pageContentRepo.save(
        this.pageContentRepo.create({
          pageKey: 'blog',
          content,
          status: 'published',
          publishedAt: new Date(),
        }),
      );
    }

    this.logger.log(`Seeded ${content.posts.length} blog posts.`);
  }

  async resetBlogPosts() {
    await this.seedBlogPosts();
  }
}
