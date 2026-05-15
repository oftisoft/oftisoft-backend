import { AffiliateLink, AffiliateLinkStatus } from '../entities/affiliate-link.entity';

export const defaultAffiliatePrograms: Partial<AffiliateLink>[] = [
  { name: 'DigitalOcean', programName: 'DigitalOcean Affiliate', description: 'Cloud hosting for developers. Get $100 free credit.', url: 'https://www.digitalocean.com/?ref=oftisoft', badgeText: 'Hosting', commissionRate: 25, category: 'hosting', sortOrder: 1 },
  { name: 'Stripe', programName: 'Stripe Partner', description: 'Payment processing for online businesses.', url: 'https://stripe.com/partners', badgeText: 'Payments', commissionRate: 0, category: 'tools', sortOrder: 2 },
  { name: 'AWS', programName: 'AWS Partner Network', description: 'Cloud infrastructure and services.', url: 'https://aws.amazon.com/partners/', badgeText: 'Cloud', commissionRate: 0, category: 'cloud', sortOrder: 3 },
  { name: 'Cloudflare', programName: 'Cloudflare Partner', description: 'CDN, DNS, DDoS protection & security.', url: 'https://www.cloudflare.com/partners/', badgeText: 'Security', commissionRate: 0, category: 'hosting', sortOrder: 4 },
  { name: 'Vercel', programName: 'Vercel Partner', description: 'Deploy frontend apps instantly. Enterprise-grade hosting.', url: 'https://vercel.com/partners', badgeText: 'Deploy', commissionRate: 0, category: 'hosting', sortOrder: 5 },
  { name: 'Supabase', programName: 'Supabase Affiliate', description: 'Open source Firebase alternative with PostgreSQL.', url: 'https://supabase.com/partners', badgeText: 'Database', commissionRate: 20, category: 'tools', sortOrder: 6 },
  { name: 'Sentry', programName: 'Sentry Partner', description: 'Error tracking and performance monitoring.', url: 'https://sentry.io/partners/', badgeText: 'Monitoring', commissionRate: 0, category: 'tools', sortOrder: 7 },
  { name: 'Algolia', programName: 'Algolia Partner', description: 'Search and discovery APIs for modern applications.', url: 'https://www.algolia.com/partners/', badgeText: 'Search', commissionRate: 0, category: 'tools', sortOrder: 8 },
  { name: 'GitHub', programName: 'GitHub Sponsors', description: 'Open source hosting and collaboration platform.', url: 'https://github.com/sponsors', badgeText: 'DevTools', commissionRate: 0, category: 'devtools', sortOrder: 9 },
  { name: 'Namecheap', programName: 'Namecheap Affiliate', description: 'Domain registration and hosting at affordable prices.', url: 'https://www.namecheap.com/partners/', badgeText: 'Domains', commissionRate: 20, category: 'hosting', sortOrder: 10 },
  { name: 'Hostinger', programName: 'Hostinger Affiliate', description: 'Budget-friendly web hosting with 30-day money-back.', url: 'https://www.hostinger.com/partners', badgeText: 'Hosting', commissionRate: 30, category: 'hosting', sortOrder: 11 },
  { name: 'ThemeForest', programName: 'Envato Affiliate', description: 'Premium website templates, themes, and UI kits.', url: 'https://themeforest.net/affiliates', badgeText: 'Templates', commissionRate: 30, category: 'design', sortOrder: 12 },
  { name: 'Linear', programName: 'Linear Partner', description: 'Issue tracking and project management for modern teams.', url: 'https://linear.app/partners', badgeText: 'Productivity', commissionRate: 0, category: 'tools', sortOrder: 13 },
  { name: 'Notion', programName: 'Notion Affiliate', description: 'All-in-one workspace for docs, wikis, and projects.', url: 'https://www.notion.so/affiliates', badgeText: 'Productivity', commissionRate: 20, category: 'tools', sortOrder: 14 },
  { name: 'Framer', programName: 'Framer Partner', description: 'Professional website builder with AI-powered design.', url: 'https://www.framer.com/partners/', badgeText: 'Design', commissionRate: 0, category: 'design', sortOrder: 15 },
];
