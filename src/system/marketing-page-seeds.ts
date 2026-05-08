type MarketingPageSeed = {
  pageKey: string;
  status: 'published' | 'draft';
  content: Record<string, unknown>;
};

const brandName = 'Oftisoft';
const founderName = 'Rasel Hossain';

export const MARKETING_PAGE_SEEDS: MarketingPageSeed[] = [
  {
    pageKey: 'navbar',
    status: 'published',
    content: {
      brandName: 'Oftisoft',
      links: [
        { id: '1', label: 'Home', href: '/' },
        { id: '2', label: 'About', href: '/about' },
        { id: '3', label: 'Services', href: '/services' },
        { id: '4', label: 'Shop', href: '/shop' },
        { id: '5', label: 'Portfolio', href: '/portfolio' },
        { id: '6', label: 'Blog', href: '/blog' },
        { id: '7', label: 'Support', href: '/support' },
      ],
      showCart: true,
      ctaText: 'Get Started',
      ctaHref: '/dashboard/register',
      seo: {
        title: 'Oftisoft Navigation',
        description: 'Primary navigation for the Oftisoft marketing site.',
        keywords: ['oftisoft', 'navigation', 'marketing site'],
        ogImage: 'https://oftisoft.com/og/nav.jpg',
        ogTitle: 'Oftisoft Navigation',
        ogDescription: 'Primary navigation for the Oftisoft marketing site.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com',
      },
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    pageKey: 'footer',
    status: 'published',
    content: {
      brandName: 'Oftisoft',
      tagline: 'Content, websites, and product systems built with clarity.',
      description:
        'A Bangladesh-based team shaping practical marketing pages, original blog content, and launch-ready digital experiences.',
      newsletterTitle: 'Stay in the loop',
      newsletterDescription:
        'Get launch notes, new blog posts, and site updates from Oftisoft.',
      newsletterPlaceholder: 'Enter your email address',
      newsletterButtonText: 'Subscribe',
      newsletterDisclaimer:
        'We only send useful updates and you can unsubscribe at any time.',
      socialLinks: [
        {
          id: '1',
          icon: 'Github',
          href: 'https://github.com',
          label: 'GitHub',
        },
        {
          id: '2',
          icon: 'Twitter',
          href: 'https://twitter.com',
          label: 'Twitter',
        },
        {
          id: '3',
          icon: 'Linkedin',
          href: 'https://linkedin.com',
          label: 'LinkedIn',
        },
        {
          id: '4',
          icon: 'Instagram',
          href: 'https://instagram.com',
          label: 'Instagram',
        },
      ],
      columns: [
        {
          id: '1',
          title: 'Product',
          links: [
            { id: '1-1', label: 'Features', href: '/features' },
            { id: '1-2', label: 'Integrations', href: '/integrations' },
            { id: '1-3', label: 'Pricing', href: '/pricing' },
            { id: '1-4', label: 'Changelog', href: '/changelog' },
            { id: '1-5', label: 'Docs', href: '/docs' },
          ],
        },
        {
          id: '2',
          title: 'Company',
          links: [
            { id: '2-1', label: 'About', href: '/about' },
            { id: '2-2', label: 'Careers', href: '/careers' },
            { id: '2-3', label: 'Blog', href: '/blog' },
            { id: '2-4', label: 'Contact', href: '/contact' },
            { id: '2-5', label: 'Partners', href: '/partners' },
          ],
        },
        {
          id: '3',
          title: 'Resources',
          links: [
            { id: '3-1', label: 'Community', href: '/community' },
            { id: '3-2', label: 'Support', href: '/support' },
            { id: '3-3', label: 'Status', href: '/status' },
            { id: '3-4', label: 'Terms', href: '/terms' },
            { id: '3-5', label: 'Privacy', href: '/privacy' },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Oftisoft. All rights reserved.`,
      statusText: 'All Systems Operational',
      seo: {
        title: 'Oftisoft Footer',
        description: 'Footer content for the Oftisoft marketing site.',
        keywords: ['oftisoft', 'footer', 'marketing site'],
        ogImage: 'https://oftisoft.com/og/footer.jpg',
        ogTitle: 'Oftisoft Footer',
        ogDescription: 'Footer content for the Oftisoft marketing site.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com',
      },
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    pageKey: 'about',
    status: 'published',
    content: {
      seo: {
        title: `About ${brandName} | Web, AI, and Product Development`,
        description: `Meet ${founderName} and learn how ${brandName} builds original web apps, mobile products, AI tools, and SEO-ready digital experiences.`,
        keywords: [
          'about Oftisoft',
          'Rasel Hossain',
          'software studio',
          'web development',
          'AI product design',
        ],
        ogImage: 'https://oftisoft.com/og/about.jpg',
        ogTitle: `About ${brandName}`,
        ogDescription:
          'A practical software studio story focused on product quality, speed, and long-term value.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com/about',
      },
      hero: {
        badge: 'About Oftisoft',
        title: 'We build software that helps businesses move with clarity.',
        highlightedWord: 'products',
        description:
          'Oftisoft is a Bangladesh-based software studio led by Rasel Hossain. We design and build websites, dashboards, mobile apps, AI features, and growth systems for teams that need clean execution and measurable results.',
        ctaText: 'Explore Our Work',
        cardTitle: 'Focused delivery',
        cardDescription:
          'Product work, not hype. Clear scope, strong communication, and reliable shipping.',
        imageAlt:
          'A modern software team planning product work around a whiteboard',
      },
      stats: [
        {
          id: 'exp',
          label: 'Years of experience',
          value: '6+',
          icon: 'ShieldCheck',
        },
        {
          id: 'projects',
          label: 'Projects delivered',
          value: '150+',
          icon: 'Zap',
        },
        {
          id: 'clients',
          label: 'Client partnerships',
          value: '80+',
          icon: 'Users',
        },
      ],
      founder: {
        name: founderName,
        role: 'Founder & Chief Architect',
        tagline: 'Designer of useful systems, not just polished screens.',
        bioPar1: `${founderName} is a full-stack developer and product builder with hands-on experience in modern web apps, SEO, AI workflows, ecommerce, and business software.`,
        bioPar2: `${brandName} was started to help companies ship practical products with less friction. We care about code quality, clear content, and a user experience that feels calm and credible.`,
        stats: [
          { num: 6, label: 'Years', suffix: '+' },
          { num: 150, label: 'Projects', suffix: '+' },
          { num: 80, label: 'Clients', suffix: '+' },
        ],
        socials: {
          github: 'https://github.com',
          linkedin: 'https://linkedin.com',
          twitter: 'https://twitter.com',
        },
        badgeTitle: 'Founder',
        titleLine1: 'Built from',
        titleLine2: 'real project work.',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
        imageAlt: 'Portrait of the founder and lead engineer',
      },
      mission: {
        badge: 'Our mission',
        titleLine1: 'Useful products,',
        titleLine2: 'built with care.',
        quote:
          'We help clients turn ideas into dependable digital products that are easier to use, easier to maintain, and easier to grow.',
        quoteHighlight: 'dependable digital products',
      },
      values: [
        {
          title: 'Practical quality',
          description:
            'We ship work that is clean, tested, and ready for real users.',
          icon: 'Target',
        },
        {
          title: 'Original thinking',
          description:
            'Every project gets a tailored approach instead of copy-paste design.',
          icon: 'Zap',
        },
        {
          title: 'Clear communication',
          description:
            'We keep planning, status, and expectations easy to follow.',
          icon: 'Handshake',
        },
        {
          title: 'Long-term support',
          description:
            'We care about what happens after launch just as much as before it.',
          icon: 'ShieldCheck',
        },
      ],
      timeline: [
        {
          year: '2018',
          title: 'Started as a solo practice',
          desc: 'Small freelance work turned into repeat client relationships.',
          icon: 'Zap',
          gradient: 'from-blue-600 to-cyan-400',
        },
        {
          year: '2020',
          title: 'Expanded service scope',
          desc: 'We began delivering full web apps, automation, and content systems.',
          icon: 'Globe',
          gradient: 'from-purple-600 to-pink-500',
        },
        {
          year: '2023',
          title: 'Built the studio brand',
          desc: 'Oftisoft became a structured software studio with a clear process.',
          icon: 'Rocket',
          gradient: 'from-amber-400 to-orange-500',
        },
        {
          year: '2026',
          title: 'SEO and AI focus',
          desc: 'We now build content-rich marketing sites, AI features, and product platforms.',
          icon: 'Clock',
          gradient: 'from-emerald-500 to-cyan-500',
        },
      ],
      timelineBadge: 'Our story',
      timelineTitle: 'How we',
      timelineTitleHighlight: 'grew.',
      culture: {
        badge: 'Working style',
        titleLine1: 'Small team,',
        titleLine2: 'serious output.',
        items: [
          {
            id: '1',
            title: 'Planning session',
            location: 'Remote / Bangladesh',
            type: 'image',
            size: 'md:col-span-2 md:row-span-2',
            thumb:
              'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
          },
          {
            id: '2',
            title: 'Design review',
            location: 'UI direction',
            type: 'image',
            size: 'md:col-span-1 md:row-span-1',
            thumb:
              'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop',
          },
          {
            id: '3',
            title: 'Launch day',
            location: 'Release workflow',
            type: 'video',
            size: 'md:col-span-1 md:row-span-2',
            thumb:
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop',
          },
          {
            id: '4',
            title: 'Engineering notes',
            location: 'Delivery process',
            type: 'image',
            size: 'md:col-span-1 md:row-span-1',
            thumb:
              'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=400&auto=format&fit=crop',
          },
        ],
      },
      awardsBadge: 'Recognition',
      awardsTitle: 'Built for',
      awardsTitleHighlight: 'real results.',
      awardsDescription:
        'Our work is measured by usefulness, speed, search performance, and client trust.',
      awards: [
        {
          id: 'a1',
          year: '2024',
          title: 'Top Web Studio',
          org: 'Independent clients',
          description: 'Recognized for reliable delivery and practical design.',
          gradient: 'from-blue-600 to-cyan-400',
        },
        {
          id: 'a2',
          year: '2025',
          title: 'SEO-Ready Systems',
          org: 'Marketing teams',
          description:
            'Known for websites that are structured for search and easy updates.',
          gradient: 'from-purple-600 to-pink-500',
        },
        {
          id: 'a3',
          year: '2026',
          title: 'AI Workflow Partner',
          org: 'Product teams',
          description:
            'Supporting teams that want AI features with clear boundaries.',
          gradient: 'from-rose-500 to-amber-500',
        },
      ],
      team: {
        badge: 'Team',
        titleLine1: 'The people',
        titleLine2: 'behind the work.',
        members: [
          {
            id: 'm1',
            name: founderName,
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
            name: 'David Chen',
            role: 'Backend Architect',
            category: 'Development',
            image:
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
            gradient: 'from-cyan-400 to-emerald-500',
            socials: { github: '#', linkedin: '#', twitter: '#' },
          },
          {
            id: 'm4',
            name: 'Alex Rivera',
            role: 'DevOps Engineer',
            category: 'Development',
            image:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&auto=format&fit=crop',
            gradient: 'from-orange-500 to-red-500',
            socials: { github: '#', linkedin: '#', twitter: '#' },
          },
        ],
      },
      cta: {
        badge: 'Let us build',
        title: 'Have a product idea or website refresh in mind?',
        highlight: 'Let’s talk.',
        description:
          'We can help you plan, design, build, and improve a site or app that supports your business goals.',
        buttonText: 'Start a project',
      },
    },
  },

  {
    pageKey: 'terms',
    status: 'published',
    content: {
      seo: {
        title: `Terms of Service | ${brandName}`,
        description: `Read the terms for using ${brandName} services, including payments, intellectual property, and user responsibilities.`,
        keywords: [
          'terms of service',
          'software terms',
          'agency terms',
          'legal',
        ],
        ogImage: 'https://oftisoft.com/og/terms.jpg',
        ogTitle: `Terms | ${brandName}`,
        ogDescription: 'Clear service terms for clients and visitors.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com/terms',
      },
      header: {
        badge: 'Service terms',
        title: 'Terms of Service',
        description:
          'These terms explain how we work, how projects are delivered, and what both sides can expect.',
        videoUrl: '',
      },
      navigationRail: {
        title: 'Sections',
        items: [
          'Use of services',
          'Project scope',
          'Payments',
          'Ownership',
          'Support',
        ],
      },
      sections: [
        {
          id: 'access',
          title: 'Access and use',
          iconName: 'Globe',
          content:
            'You may use our site and services for lawful, agreed-upon work only.',
        },
        {
          id: 'ownership',
          title: 'Project ownership',
          iconName: 'Scale',
          content:
            'Client-owned deliverables belong to the client after payment unless a separate license is agreed.',
        },
        {
          id: 'liability',
          title: 'Delivery and liability',
          iconName: 'Zap',
          content:
            'We aim for reliable delivery, but third-party outages and misuse are outside our control.',
        },
      ],
      revision: {
        prefix: 'Last updated:',
        updatedAt: new Date().toLocaleDateString(),
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'support',
    status: 'published',
    content: {
      seo: {
        title: `Support | ${brandName}`,
        description: `Get help with web, mobile, AI, and ecommerce projects from ${brandName}.`,
        keywords: ['support', 'help center', 'technical support', 'contact'],
        ogImage: 'https://oftisoft.com/og/support.jpg',
        ogTitle: `Support | ${brandName}`,
        ogDescription: 'Practical support channels for clients and visitors.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com/support',
      },
      header: {
        badge: 'Support',
        title: 'How can we help?',
        searchPlaceholder: 'Search support topics...',
        videoUrl: '',
      },
      channels: [
        {
          id: 'bot',
          title: 'Chat support',
          desc: 'Quick help for common questions and project requests.',
          iconName: 'Bot',
          color: 'text-primary',
        },
        {
          id: 'chat',
          title: 'Live chat',
          desc: 'Real-time communication when you need a fast answer.',
          iconName: 'MessageSquare',
          color: 'text-blue-500',
        },
        {
          id: 'docs',
          title: 'Documentation',
          desc: 'Guides and reference material for common workflows.',
          iconName: 'Terminal',
          color: 'text-purple-500',
        },
      ],
      faq: {
        badge: 'FAQ',
        title: 'Common questions',
        items: [
          {
            id: 'sync',
            q: 'How do I start a project?',
            a: 'Send a short brief through the contact form and we will review scope, goals, and timeline.',
          },
          {
            id: 'latency',
            q: 'How fast do you respond?',
            a: 'We usually respond within one business day, and faster for active client projects.',
          },
          {
            id: 'billing',
            q: 'How do you price work?',
            a: 'Pricing depends on scope, timeline, and support needs. We can start with a small discovery call.',
          },
        ],
      },
      priorityRelay: {
        title: 'Priority support',
        description:
          'For urgent client issues, we offer direct support and rapid follow-up.',
        buttons: [
          { label: 'Open priority chat', iconName: 'Zap', variant: 'default' },
          { label: 'Send email', iconName: 'Mail', variant: 'outline' },
        ],
        metrics: [
          {
            id: 'response',
            label: 'Typical response',
            value: '< 1 business day',
            iconName: 'Clock',
          },
          {
            id: 'engineers',
            label: 'Support coverage',
            value: 'Project-based',
            iconName: 'CheckCircle2',
          },
        ],
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'home',
    status: 'published',
    content: {
      seo: {
        title: `Oftisoft | Web Development, AI, and SEO-Ready Digital Products`,
        description:
          'Oftisoft builds modern websites, dashboards, mobile apps, AI features, and marketing systems for businesses that want measurable growth.',
        keywords: [
          'web development',
          'AI development',
          'SEO websites',
          'mobile apps',
          'software studio',
        ],
        ogImage: 'https://oftisoft.com/og/home.jpg',
        ogTitle: 'Oftisoft',
        ogDescription:
          'Modern software built with clarity, speed, and business goals in mind.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com',
      },
      hero: {
        id: 'hero-1',
        title: 'Build a stronger digital presence.',
        subtitle:
          'Software, websites, and AI that help your business move faster.',
        description:
          'We design and build practical digital products: fast marketing sites, client portals, internal dashboards, ecommerce systems, and AI-powered workflows.',
        badge: 'Available for new projects',
        primaryCTA: { text: 'Start a project', link: '/#contact' },
        secondaryCTA: { text: 'View services', link: '/services' },
        imageAlt: 'A clean modern digital product interface on a large screen',
        stats: [
          { value: 150, suffix: '+', label: 'Projects delivered' },
          { value: 98, suffix: '%', label: 'Client satisfaction' },
          { value: 6, suffix: '+', label: 'Years experience' },
        ],
        subtitles: [
          'Web development.',
          'AI features.',
          'SEO-ready content.',
          'Product design.',
        ],
        enabled: true,
      },
      services: {
        id: 'services-1',
        title: 'What we do',
        subtitle: 'Useful work, shipped well.',
        badge: 'Services',
        services: [
          {
            id: 'svc-1',
            title: 'Web development',
            description:
              'Fast, responsive websites and web apps with clean code and strong SEO foundations.',
            icon: 'Globe',
            tags: ['Next.js', 'React', 'TypeScript'],
            gradient: 'from-blue-500 to-cyan-500',
            color: 'text-blue-400',
          },
          {
            id: 'svc-2',
            title: 'Mobile apps',
            description:
              'Cross-platform apps that feel native, stable, and easy to grow.',
            icon: 'Smartphone',
            tags: ['React Native', 'Flutter', 'MAUI'],
            gradient: 'from-purple-500 to-pink-500',
            color: 'text-purple-400',
          },
          {
            id: 'svc-3',
            title: 'AI integration',
            description:
              'Practical AI features that assist users, improve workflows, and save time.',
            icon: 'Cpu',
            tags: ['OpenAI', 'Automation', 'RAG'],
            gradient: 'from-green-500 to-emerald-500',
            color: 'text-green-400',
          },
          {
            id: 'svc-4',
            title: 'Cloud and DevOps',
            description:
              'Secure deployments, performance tuning, and infrastructure that can scale.',
            icon: 'Cloud',
            tags: ['AWS', 'Vercel', 'Docker'],
            gradient: 'from-orange-500 to-red-500',
            color: 'text-orange-400',
          },
        ],
        enabled: true,
      },
      projects: {
        id: 'projects-1',
        title: 'Selected work',
        subtitle: 'A few real-world examples.',
        badge: 'Portfolio',
        projects: [
          {
            id: 'proj-1',
            title: 'FinTech Dashboard',
            description:
              'A trading and analytics dashboard for financial teams.',
            category: 'Finance',
            imageGradient: 'from-blue-600 via-indigo-600 to-violet-600',
            tech: ['Next.js', 'WebSocket', 'Redis'],
            stats: [
              { label: 'Users', value: '50K+' },
              { label: 'Uptime', value: '99.9%' },
            ],
            year: '2025',
            imageAlt: 'Analytics dashboard with charts and live market data',
          },
          {
            id: 'proj-2',
            title: 'AI Content Studio',
            description:
              'A content workflow platform with AI-assisted drafting and review.',
            category: 'AI',
            imageGradient: 'from-purple-600 via-pink-600 to-rose-600',
            tech: ['React', 'OpenAI', 'Postgres'],
            stats: [
              { label: 'Speed', value: '+60%' },
              { label: 'Cost', value: '-35%' },
            ],
            year: '2026',
            imageAlt:
              'Content editor with AI suggestions and publishing controls',
          },
          {
            id: 'proj-3',
            title: 'Retail Launch Site',
            description: 'A conversion-focused ecommerce landing experience.',
            category: 'Ecommerce',
            imageGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
            tech: ['Next.js', 'Shopify', 'SEO'],
            stats: [
              { label: 'Lift', value: '+28%' },
              { label: 'Speed', value: '100' },
            ],
            year: '2026',
            imageAlt:
              'Elegant ecommerce landing page with product cards and checkout CTA',
          },
        ],
        enabled: true,
      },
      testimonials: {
        badge: 'What clients say',
        title: 'Trusted by teams that need dependable delivery.',
        entries: [
          {
            name: 'Sarah Jenkins',
            role: 'Founder, Creative Pulse',
            quote:
              'The site feels sharper, faster, and easier to update than what we had before.',
            gradient: 'from-orange-500 to-amber-500',
          },
          {
            name: 'David Kim',
            role: 'VP Engineering, CloudScale',
            quote:
              'They kept the scope clear and delivered a smooth, well-structured product.',
            gradient: 'from-cyan-500 to-blue-500',
          },
        ],
        enabled: true,
      },
      techStack: {
        id: 'techstack-1',
        title: 'Built with',
        subtitle: 'Tools we trust.',
        badge: 'Technology',
        technologies: [
          { name: 'Next.js', icon: 'Globe', color: 'text-white' },
          { name: 'React', icon: 'Code2', color: 'text-blue-400' },
          { name: 'TypeScript', icon: 'Code2', color: 'text-blue-500' },
          { name: 'Node.js', icon: 'Server', color: 'text-green-500' },
          { name: 'PostgreSQL', icon: 'Database', color: 'text-blue-300' },
          { name: 'Docker', icon: 'Box', color: 'text-blue-500' },
        ],
        enabled: true,
      },
      blog: {
        title: 'Insights from the',
        subtitle: 'Bleeding Edge.',
        badge: 'Thought Leadership',
        posts: [
          {
            id: 'post-001',
            slug: 'ai-web-dev',
            title: 'The Agentic Web: How AI is Rewriting the Frontend',
            excerpt:
              'Why traditional UI components are being replaced by generative interfaces.',
            category: 'Deep Tech',
            date: 'Oct 15, 2026',
            readTime: '5 min',
            gradient: 'from-blue-600 via-indigo-600 to-violet-600',
          },
          {
            id: 'post-002',
            slug: 'nextjs-performance',
            title: 'Next.js 16.2 Performance Playbook',
            excerpt:
              'A practical guide to faster production apps with the latest Next.js features.',
            category: 'Web Architecture',
            date: 'Oct 10, 2026',
            readTime: '8 min',
            gradient: 'from-cyan-600 to-blue-700',
          },
          {
            id: 'post-003',
            slug: 'seo-ai-search',
            title: 'SEO for AI Search and Answer Engines',
            excerpt:
              'What still works in 2026 when optimizing for AI-driven search results.',
            category: 'SEO & Growth',
            date: 'Oct 05, 2026',
            readTime: '6 min',
            gradient: 'from-orange-500 to-rose-600',
          },
          {
            id: 'post-004',
            slug: 'mobile-first-dashboard',
            title: 'Mobile-First Dashboard Design',
            excerpt:
              'Design patterns for busy business users who need data on the go.',
            category: 'Mobile Design',
            date: 'Sep 28, 2026',
            readTime: '7 min',
            gradient: 'from-emerald-600 to-teal-700',
          },
        ],
      },
      cta: {
        badge: 'Ready when you are',
        title: 'Need a website, app, or product sprint?',
        highlight: 'Let’s build it.',
        description:
          'We can help you plan the right solution and ship it with a clean process.',
        buttonText: 'Contact us',
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'blog',
    status: 'published',
    content: {
      seo: {
        title: `Blog | ${brandName}`,
        description: `Original articles about web development, AI, SEO, mobile apps, and product growth from ${brandName}.`,
        keywords: ['blog', 'web development', 'AI', 'SEO', 'software articles'],
        ogImage: 'https://oftisoft.com/og/blog.jpg',
        ogTitle: `${brandName} Blog`,
        ogDescription:
          'Practical software articles written for builders and business owners.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com/blog',
      },
      hero: {
        title: 'Oftisoft Insights',
        subtitle:
          'Practical guides, original thinking, and SEO-friendly articles for modern teams.',
      },
      categories: [
        { id: 'all', label: 'All topics', slug: 'all', icon: 'Grid' },
        { id: 'web', label: 'Web', slug: 'engineering', icon: 'Code' },
        { id: 'mobile', label: 'Mobile', slug: 'mobile', icon: 'Smartphone' },
        { id: 'ai', label: 'AI', slug: 'ai-data', icon: 'Brain' },
        { id: 'devops', label: 'DevOps', slug: 'devops', icon: 'Cloud' },
        { id: 'business', label: 'Growth', slug: 'growth', icon: 'Briefcase' },
      ],
      authors: [
        {
          id: 'auth-1',
          name: founderName,
          role: 'Software Engineer',
          avatar: '',
          initials: 'RH',
          bio: 'Founder of Oftisoft and lead author for engineering and product content.',
          stats: [
            { label: 'Articles', value: '40+' },
            { label: 'Focus', value: 'Web + AI' },
          ],
          tags: ['Architecture', 'AI', 'Frontend'],
          socials: { twitter: '#', linkedin: '#', github: '#' },
        },
        {
          id: 'auth-2',
          name: 'Sarah Jenkins',
          role: 'Product Designer',
          avatar: '',
          initials: 'SJ',
          bio: 'Writes about UX, content clarity, and design systems.',
          stats: [
            { label: 'Articles', value: '15+' },
            { label: 'Focus', value: 'UX' },
          ],
          tags: ['UI/UX', 'Design Systems'],
          socials: { twitter: '#', linkedin: '#', website: '#' },
        },
        {
          id: 'auth-3',
          name: 'David Chen',
          role: 'Cloud Architect',
          avatar: '',
          initials: 'DC',
          bio: 'Covers backend, infrastructure, and reliability topics.',
          stats: [
            { label: 'Articles', value: '12+' },
            { label: 'Focus', value: 'DevOps' },
          ],
          tags: ['Backend', 'Cloud', 'Security'],
          socials: { github: '#', linkedin: '#', website: '#' },
        },
        {
          id: 'auth-4',
          name: 'Maya Rahman',
          role: 'Growth Strategist',
          avatar: '',
          initials: 'MR',
          bio: 'Writes SEO and growth content for technical brands.',
          stats: [
            { label: 'Articles', value: '18+' },
            { label: 'Focus', value: 'SEO' },
          ],
          tags: ['SEO', 'Content', 'Conversion'],
          socials: { twitter: '#', linkedin: '#', website: '#' },
        },
      ],
      posts: [
        {
          id: 'post-001',
          slug: 'ai-web-dev',
          title: 'The Agentic Web: How AI is Rewriting the Frontend',
          excerpt:
            'Why traditional UI components are being replaced by generative interfaces.',
          content:
            '<h2>The Agentic Web</h2><p>AI is transforming how we build and interact with web applications.</p>',
          coverImage:
            'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1800&auto=format&fit=crop',
          category: 'ai',
          authorId: 'auth-1',
          date: 'Oct 15, 2026',
          readTime: '5 min read',
          views: '12.5k',
          featured: true,
          popularResult: true,
          popularRank: '01',
          gradient: 'from-blue-600 via-indigo-600 to-violet-600',
          status: 'published',
        },
        {
          id: 'post-002',
          slug: 'nextjs-performance',
          title: 'Next.js 16.2 Performance Playbook',
          excerpt:
            'A practical guide to faster production apps with the latest Next.js features.',
          content:
            '<h2>Performance First</h2><p>Learn the best practices for optimizing Next.js applications.</p>',
          coverImage:
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1800&auto=format&fit=crop',
          category: 'web',
          authorId: 'auth-1',
          date: 'Oct 10, 2026',
          readTime: '8 min read',
          views: '15.2k',
          featured: true,
          popularResult: true,
          popularRank: '02',
          gradient: 'from-cyan-600 to-blue-700',
          status: 'published',
        },
        {
          id: 'post-003',
          slug: 'seo-ai-search',
          title: 'SEO for AI Search and Answer Engines',
          excerpt:
            'What still works in 2026 when optimizing for AI-driven search results.',
          content:
            '<h2>SEO in the AI Era</h2><p>Discover strategies for optimizing content for AI-powered search engines.</p>',
          coverImage:
            'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1800&auto=format&fit=crop',
          category: 'business',
          authorId: 'auth-4',
          date: 'Oct 05, 2026',
          readTime: '6 min read',
          views: '9.8k',
          featured: false,
          popularResult: true,
          popularRank: '03',
          gradient: 'from-orange-500 to-rose-600',
          status: 'published',
        },
        {
          id: 'post-004',
          slug: 'mobile-first-dashboard',
          title: 'Mobile-First Dashboard Design',
          excerpt:
            'Design patterns for busy business users who need data on the go.',
          content:
            '<h2>Mobile Dashboards</h2><p>Best practices for creating responsive dashboards.</p>',
          coverImage:
            'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1800&auto=format&fit=crop',
          category: 'mobile',
          authorId: 'auth-2',
          date: 'Sep 28, 2026',
          readTime: '7 min read',
          views: '8.4k',
          featured: true,
          popularResult: false,
          gradient: 'from-emerald-600 to-teal-700',
          status: 'published',
        },
        {
          id: 'post-005',
          slug: 'secure-auth-mern',
          title: 'Secure Authentication for MERN Stack Apps',
          excerpt:
            'Sessions, JWTs, and 2FA implementation strategies for modern web apps.',
          content:
            '<h2>Secure Auth</h2><p>Implement robust authentication in your MERN applications.</p>',
          coverImage:
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1800&auto=format&fit=crop',
          category: 'devops',
          authorId: 'auth-3',
          date: 'Sep 25, 2026',
          readTime: '10 min read',
          views: '11.2k',
          featured: false,
          popularResult: true,
          popularRank: '04',
          gradient: 'from-red-500 to-orange-600',
          status: 'published',
        },
        {
          id: 'post-006',
          slug: 'design-systems-ship',
          title: 'Design Systems That Ship Faster',
          excerpt:
            'Tokens, components, and governance patterns for productive teams.',
          content:
            '<h2>Design Systems</h2><p>Build scalable design systems that speed up development.</p>',
          coverImage:
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1800&auto=format&fit=crop',
          category: 'web',
          authorId: 'auth-2',
          date: 'Sep 20, 2026',
          readTime: '8 min read',
          views: '7.6k',
          featured: false,
          popularResult: false,
          gradient: 'from-fuchsia-600 to-pink-600',
          status: 'published',
        },
      ],
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'portfolio',
    status: 'published',
    content: {
      seo: {
        title: `Portfolio | ${brandName}`,
        description:
          'A selection of web, mobile, AI, and ecommerce projects built for real clients.',
        keywords: [
          'portfolio',
          'case studies',
          'web projects',
          'mobile apps',
          'AI solutions',
        ],
        ogImage: 'https://oftisoft.com/og/portfolio.jpg',
        ogTitle: `${brandName} Portfolio`,
        ogDescription:
          'Selected work focused on business outcomes and product quality.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com/portfolio',
      },
      header: {
        badge: 'Selected work',
        title: 'Projects that solve real problems.',
        description:
          'We build websites and apps that are useful, clear, and measurable.',
        videoUrl: '',
      },
      projects: [
        {
          id: 'proj-1',
          title: 'EcoSmart Ecommerce',
          category: 'Ecommerce',
          image:
            'https://images.unsplash.com/photo-1523474253062-5e4ead0d166d?q=80&w=800&auto=format&fit=crop',
          imageAlt:
            'Ecommerce storefront with product photography and checkout flow',
          tags: ['Next.js', 'Stripe', 'SEO'],
          description:
            'A sustainable shopping experience with a clean checkout journey.',
          longDescription:
            'Built to improve conversion, speed, and product discovery for a growing retail brand.',
          client: 'EcoLife Inc.',
          stats: [
            { label: 'ROI', value: '250%' },
            { label: 'Sales', value: '$2M+' },
          ],
          gradient: 'from-emerald-500/20 to-teal-500/20',
        },
        {
          id: 'proj-2',
          title: 'FinTech Analytics Core',
          category: 'Enterprise',
          image:
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
          imageAlt: 'Dashboard with financial graphs and analytics charts',
          tags: ['React', 'D3.js', 'Node.js'],
          description:
            'A performance dashboard for high-volume financial data.',
          longDescription:
            'Created to help teams inspect and act on large transaction datasets without lag.',
          client: 'FinanceFlow',
          stats: [
            { label: 'Latency', value: '<50ms' },
            { label: 'Users', value: '50k' },
          ],
          gradient: 'from-blue-600/20 to-indigo-600/20',
        },
        {
          id: 'proj-3',
          title: 'Nexus AI Assistant',
          category: 'AI',
          image:
            'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
          imageAlt: 'AI assistant interface with chat and task panels',
          tags: ['Python', 'LangChain', 'FastAPI'],
          description: 'A support assistant for faster customer responses.',
          longDescription:
            'Designed to reduce repetitive support work while keeping answers grounded in approved content.',
          client: 'TechHelp',
          stats: [
            { label: 'Automation', value: '80%' },
            { label: 'Cost Saving', value: '40%' },
          ],
          gradient: 'from-purple-600/20 to-pink-600/20',
        },
      ],
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'services',
    status: 'published',
    content: {
      seo: {
        title: `Services | ${brandName}`,
        description:
          'Web development, mobile apps, AI features, SEO, and cloud delivery for growing teams.',
        keywords: [
          'web development services',
          'AI integration',
          'mobile app development',
          'SEO',
          'cloud services',
        ],
        ogImage: 'https://oftisoft.com/og/services.jpg',
        ogTitle: `${brandName} Services`,
        ogDescription:
          'Practical service offerings for websites, apps, AI, and cloud systems.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com/services',
      },
      heroVideoUrl: '',
      overview: [
        {
          id: 'web',
          label: 'Web',
          iconName: 'Globe',
          gradient: 'from-blue-600 to-cyan-500',
          title: 'Web apps and marketing sites',
          subtitle: 'Fast, clear, SEO-ready',
          description:
            'We build sites and apps that are easy to use and easy to find.',
          features: [
            {
              iconName: 'Zap',
              title: 'Speed',
              desc: 'Performance-focused builds',
            },
            {
              iconName: 'ShieldCheck',
              title: 'Reliability',
              desc: 'Stable production delivery',
            },
          ],
          techs: ['Next.js', 'React', 'TypeScript'],
          image:
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
          imageAlt: 'Modern web app interface on a desktop display',
        },
        {
          id: 'mobile',
          label: 'Mobile',
          iconName: 'Smartphone',
          gradient: 'from-purple-600 to-pink-500',
          title: 'Mobile apps',
          subtitle: 'Helpful on any device',
          description:
            'Cross-platform apps that feel natural and stay maintainable.',
          features: [
            {
              iconName: 'Smartphone',
              title: 'Native feel',
              desc: 'Built for smooth interaction',
            },
            {
              iconName: 'WifiOff',
              title: 'Offline ready',
              desc: 'Designed for real-world connectivity',
            },
          ],
          techs: ['React Native', 'Flutter', 'MAUI'],
          image:
            'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
          imageAlt: 'Mobile app interface shown on a smartphone',
        },
        {
          id: 'ai',
          label: 'AI',
          iconName: 'Cpu',
          gradient: 'from-green-600 to-emerald-500',
          title: 'AI features',
          subtitle: 'Useful, grounded, measurable',
          description:
            'We add AI where it improves the product, not just the pitch deck.',
          features: [
            {
              iconName: 'Bot',
              title: 'Assistants',
              desc: 'Smart helpers for users and teams',
            },
            {
              iconName: 'Search',
              title: 'Semantic search',
              desc: 'Find content by meaning',
            },
          ],
          techs: ['OpenAI', 'LangChain', 'Python'],
          image:
            'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
          imageAlt: 'AI workflow and chat interface on a futuristic screen',
        },
        {
          id: 'devops',
          label: 'Cloud',
          iconName: 'Cloud',
          gradient: 'from-orange-500 to-red-500',
          title: 'Cloud and DevOps',
          subtitle: 'Safer deploys, better uptime',
          description:
            'We help teams ship with confidence and keep infrastructure under control.',
          features: [
            {
              iconName: 'Server',
              title: 'Deployments',
              desc: 'Practical CI/CD setups',
            },
            {
              iconName: 'Activity',
              title: 'Monitoring',
              desc: 'Clear alerts and observability',
            },
          ],
          techs: ['AWS', 'Docker', 'Vercel'],
          image:
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
          imageAlt: 'Cloud infrastructure dashboard and deployment tools',
        },
      ],
      comparison: {
        features: [
          {
            name: 'Custom design',
            tooltip: 'Unique interfaces for your brand',
          },
          {
            name: 'SEO setup',
            tooltip: 'Metadata, structure, and indexing readiness',
          },
          { name: 'CMS integration', tooltip: 'Easy content editing' },
          {
            name: 'API integration',
            tooltip: 'Connect external tools and services',
          },
        ],
        tiers: [
          {
            id: 'starter',
            name: 'Starter',
            price: '$2,999',
            description: 'A focused site or landing page build.',
            iconName: 'Zap',
            color: 'text-blue-500',
            highlight: false,
            features: [true, true, true, false],
          },
          {
            id: 'growth',
            name: 'Growth',
            price: '$5,499',
            description: 'A business site with deeper functionality.',
            iconName: 'Sparkles',
            color: 'text-purple-500',
            highlight: true,
            features: [true, true, true, true],
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            description: 'Custom software and long-term support.',
            iconName: 'Crown',
            color: 'text-orange-500',
            highlight: false,
            features: [true, true, true, true],
          },
        ],
      },
      packages: [
        {
          id: 'starter',
          name: 'Starter',
          price: 2999,
          monthlyPrice: 299,
          description: 'A lean launch package.',
          features: ['Responsive design', 'SEO foundations', 'CMS setup'],
          highlight: false,
          iconName: 'Rocket',
          gradient: 'from-blue-500/20 to-cyan-500/20',
        },
        {
          id: 'growth',
          name: 'Growth',
          price: 5499,
          monthlyPrice: 599,
          description: 'For teams that need more structure.',
          features: [
            'Everything in Starter',
            'Analytics',
            'Forms and integrations',
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
          description: 'Custom systems and support.',
          features: [
            'Architecture planning',
            'API integration',
            'Dedicated support',
          ],
          highlight: false,
          iconName: 'Crown',
          gradient: 'from-orange-500/20 to-red-500/20',
        },
      ],
      process: [
        {
          id: 1,
          title: 'Discovery',
          desc: 'We define goals, users, and scope.',
          iconName: 'Video',
          color: 'text-blue-500',
        },
        {
          id: 2,
          title: 'Design',
          desc: 'We map the interface and content flow.',
          iconName: 'FileText',
          color: 'text-purple-500',
        },
        {
          id: 3,
          title: 'Development',
          desc: 'We build in clean, testable steps.',
          iconName: 'Code2',
          color: 'text-yellow-500',
        },
        {
          id: 4,
          title: 'QA',
          desc: 'We check performance, accessibility, and bugs.',
          iconName: 'ClipboardCheck',
          color: 'text-red-500',
        },
        {
          id: 5,
          title: 'Launch',
          desc: 'We deploy, train, and hand off clearly.',
          iconName: 'Rocket',
          color: 'text-green-500',
        },
        {
          id: 6,
          title: 'Iterate',
          desc: 'We improve based on real usage.',
          iconName: 'HeartPulse',
          color: 'text-cyan-500',
        },
      ],
      startId: 1,
      faqs: [
        {
          id: 'timeline',
          category: 'General',
          question: 'How long does work take?',
          answer:
            'Most projects take a few weeks to a few months depending on complexity.',
        },
        {
          id: 'hosting',
          category: 'Technical',
          question: 'Do you handle hosting?',
          answer:
            'Yes, we can set up and guide deployment on common platforms.',
        },
        {
          id: 'payment',
          category: 'Billing',
          question: 'How does payment work?',
          answer:
            'We usually use milestone-based payments tied to deliverables.',
        },
      ],
      techStack: [
        {
          id: 'frontend',
          label: 'Frontend',
          iconName: 'Layout',
          description: 'Modern interfaces',
          techs: ['React', 'Next.js', 'Tailwind'],
        },
        {
          id: 'backend',
          label: 'Backend',
          iconName: 'Server',
          description: 'API and server logic',
          techs: ['Node.js', 'NestJS', 'Express'],
        },
        {
          id: 'database',
          label: 'Database',
          iconName: 'Database',
          description: 'Reliable storage',
          techs: ['PostgreSQL', 'MongoDB', 'Redis'],
        },
        {
          id: 'cloud',
          label: 'Cloud',
          iconName: 'Cloud',
          description: 'Deployment and infrastructure',
          techs: ['AWS', 'Vercel', 'Docker'],
        },
        {
          id: 'ai',
          label: 'AI',
          iconName: 'Brain',
          description: 'Practical AI features',
          techs: ['OpenAI', 'LangChain', 'Python'],
        },
        {
          id: 'mobile',
          label: 'Mobile',
          iconName: 'Smartphone',
          description: 'App delivery',
          techs: ['React Native', 'Flutter', 'PWA'],
        },
      ],
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'contact',
    status: 'published',
    content: {
      seo: {
        title: `Contact | ${brandName}`,
        description: `Contact ${brandName} to discuss web development, AI, SEO, mobile apps, or a custom product idea.`,
        keywords: [
          'contact Oftisoft',
          'hire developer',
          'software consultation',
          'Bangladesh software studio',
        ],
        ogImage: 'https://oftisoft.com/og/contact.jpg',
        ogTitle: `Contact ${brandName}`,
        ogDescription:
          'A direct way to reach the studio and start a project conversation.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com/contact',
      },
      header: {
        badge: 'Contact',
        titlePrefix: 'Start a',
        titleHighlight: 'conversation',
        titleSuffix: '.',
        description:
          'Tell us what you want to build and we will reply with next steps.',
      },
      contactInfo: [
        {
          id: 'info-1',
          title: 'Location',
          value: 'Satkhira, Bangladesh',
          iconName: 'MapPin',
          color: 'text-blue-500',
          order: 1,
        },
        {
          id: 'info-2',
          title: 'Email',
          value: 'oftisoft@gmail.com',
          iconName: 'Mail',
          color: 'text-primary',
          order: 2,
        },
        {
          id: 'info-3',
          title: 'Phone',
          value: '+880 1410-615665',
          iconName: 'Phone',
          color: 'text-green-500',
          order: 3,
        },
        {
          id: 'info-4',
          title: 'WhatsApp',
          value: '+880 1410-615665',
          iconName: 'MessageCircle',
          color: 'text-green-500',
          order: 4,
        },
      ],
      statusNode: {
        title: 'Response status',
        status: 'ACTIVE',
        latencyText: 'We usually respond within one business day.',
      },
      form: {
        title: 'Tell us about your project',
        description:
          'Share a short brief and we will follow up with questions, options, and a rough plan.',
        nameLabel: 'Your name',
        emailLabel: 'Email address',
        subjectLabel: 'Project subject',
        messageLabel: 'Project details',
        buttonText: 'Send message',
      },
      footer: {
        encryptedText: 'Your message is handled securely.',
        agentText: 'A real person reviews new project requests.',
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'status',
    status: 'published',
    content: {
      seo: {
        title: `System Status | ${brandName}`,
        description:
          'Live service status and uptime information for Oftisoft systems.',
        keywords: ['status', 'uptime', 'incident history', 'service health'],
        ogImage: 'https://oftisoft.com/og/status.jpg',
        ogTitle: `System Status | ${brandName}`,
        ogDescription: 'Current health and incident history for our services.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com/status',
      },
      header: {
        badge: 'System status',
        title: 'All systems operational.',
        mainStatus: {
          title: 'Operational',
          description: 'Core services are running normally.',
        },
        videoUrl: '',
      },
      systems: [
        {
          id: 'edge',
          name: 'Edge proxy',
          status: 'Operational',
          uptime: '99.99%',
          latency: '14ms',
          iconName: 'Globe',
          color: 'text-green-500',
        },
        {
          id: 'neural',
          name: 'AI services',
          status: 'Operational',
          uptime: '100%',
          latency: '128ms',
          iconName: 'Cpu',
          color: 'text-green-500',
        },
        {
          id: 'forge',
          name: 'API layer',
          status: 'Operational',
          uptime: '99.95%',
          latency: '42ms',
          iconName: 'Zap',
          color: 'text-green-500',
        },
        {
          id: 'cdn',
          name: 'CDN nodes',
          status: 'Operational',
          uptime: '99.9%',
          latency: '45ms',
          iconName: 'Server',
          color: 'text-green-500',
        },
        {
          id: 'identity',
          name: 'Identity services',
          status: 'Operational',
          uptime: '100%',
          latency: '8ms',
          iconName: 'ShieldCheck',
          color: 'text-green-500',
        },
        {
          id: 'vaults',
          name: 'Asset vaults',
          status: 'Operational',
          uptime: '99.99%',
          latency: '31ms',
          iconName: 'Database',
          color: 'text-green-500',
        },
      ],
      incidents: {
        title: 'Recent incidents',
        logs: [
          {
            id: 'i1',
            date: 'Feb 06, 2026',
            title: 'Edge rollout delay',
            desc: 'A regional edge update took longer than expected.',
            status: 'Resolved',
            color: 'bg-green-500',
          },
          {
            id: 'i2',
            date: 'Jan 28, 2026',
            title: 'Identity refresh issue',
            desc: 'A short MFA refresh interruption was resolved quickly.',
            status: 'Resolved',
            color: 'bg-green-500',
          },
        ],
      },
      monitoring: {
        note: 'We monitor uptime and error signals continuously.',
        nextSyncText: 'Next refresh in 5s',
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'careers',
    status: 'published',
    content: {
      hero: {
        badge: 'Careers',
        titlePrefix: 'Build the',
        titleHighlight: 'next version',
        titleSuffix: '.',
        description:
          'Join a small team that values clear thinking, practical delivery, and original work.',
      },
      cultureValues: [
        {
          id: 'val-1',
          title: 'Calm execution',
          description: 'We keep work organized and easy to follow.',
          iconName: 'Flame',
          color: 'text-primary',
        },
        {
          id: 'val-2',
          title: 'Remote first',
          description: 'We collaborate well across location and time zone.',
          iconName: 'Rocket',
          color: 'text-blue-500',
        },
      ],
      jobs: [
        {
          id: 'job-1',
          title: 'Senior Full-Stack Engineer',
          team: 'Product delivery',
          type: 'Full-Time / Remote',
          location: 'Remote',
          description: 'Build client-facing products and internal tools.',
          requirements: ['React / Next.js', 'Node.js', 'TypeScript'],
          iconName: 'Code2',
          color: 'text-primary',
          isActive: true,
        },
        {
          id: 'job-2',
          title: 'UI / Motion Designer',
          team: 'Design',
          type: 'Full-Time / Remote',
          location: 'Remote',
          description: 'Shape interfaces, motion, and presentation.',
          requirements: ['Figma', 'Design systems', 'Motion design'],
          iconName: 'Sparkles',
          color: 'text-blue-500',
          isActive: true,
        },
        {
          id: 'job-3',
          title: 'DevOps Engineer',
          team: 'Infrastructure',
          type: 'Contract / Remote',
          location: 'Remote',
          description: 'Support deployment and reliability work.',
          requirements: ['Docker', 'CI/CD', 'Monitoring'],
          iconName: 'Cloud',
          color: 'text-green-500',
          isActive: true,
        },
      ],
      contact: {
        title: 'Interested in joining?',
        description:
          'Send a short intro, your location, and a portfolio or GitHub link.',
        buttonText: 'Apply now',
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'changelog',
    status: 'published',
    content: {
      header: {
        badge: 'Release notes',
        titlePrefix: 'Changelog',
        titleSuffix: '.',
        description: 'A simple record of product, content, and system updates.',
      },
      updates: [
        {
          id: 'v2.5.0',
          version: 'v2.5.0',
          date: 'Apr 22, 2026',
          title: 'Marketing rewrite',
          description:
            'Reworked the marketing seed content with original SEO-focused copy.',
          category: 'Major',
          changes: [
            'Rewrote page content',
            'Added blog expansion',
            'Refreshed SEO copy',
          ],
          iconName: 'Sparkles',
          isActive: true,
        },
        {
          id: 'v2.4.5',
          version: 'v2.4.5',
          date: 'Mar 18, 2026',
          title: 'Content cleanup',
          description: 'Clarified service and support language across pages.',
          category: 'Update',
          changes: [
            'Simplified messaging',
            'Improved structure',
            'Smarter defaults',
          ],
          iconName: 'Zap',
          isActive: true,
        },
        {
          id: 'v2.4.0',
          version: 'v2.4.0',
          date: 'Feb 05, 2026',
          title: 'Seed architecture',
          description:
            'Unified the content seed approach for the marketing site.',
          category: 'Feature',
          changes: [
            'Centralized page records',
            'Added SEO fields',
            'Improved updates',
          ],
          iconName: 'Cpu',
          isActive: true,
        },
      ],
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'community',
    status: 'published',
    content: {
      header: {
        badge: 'Community',
        title: 'Join the conversation',
        highlight: 'nexus',
        description:
          'Follow our work, ask questions, and connect with people building modern software.',
      },
      links: [
        {
          id: 'link-1',
          title: 'GitHub',
          label: 'Open source and code',
          iconName: 'Github',
          color: 'text-white',
          url: 'https://github.com',
          isActive: true,
        },
        {
          id: 'link-2',
          title: 'Discord',
          label: 'Live chat and updates',
          iconName: 'MessageSquare',
          color: 'text-indigo-400',
          url: 'https://discord.com',
          isActive: true,
        },
        {
          id: 'link-3',
          title: 'Slack',
          label: 'Team collaboration',
          iconName: 'Slack',
          color: 'text-blue-400',
          url: 'https://slack.com',
          isActive: true,
        },
        {
          id: 'link-4',
          title: 'X',
          label: 'News and releases',
          iconName: 'Twitter',
          color: 'text-blue-500',
          url: 'https://twitter.com',
          isActive: true,
        },
      ],
      newsletter: {
        title: 'Newsletter',
        description: 'Weekly notes on web, AI, and growth.',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
        footerText: 'Built for founders, teams, and creators.',
      },
      stats: [
        { id: 'stat-1', value: '4.8k+', label: 'Followers', order: 1 },
        { id: 'stat-2', value: '1.2m', label: 'Views', order: 2 },
        { id: 'stat-3', value: '100+', label: 'Contributors', order: 3 },
      ],
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'docs',
    status: 'published',
    content: {
      header: {
        badge: 'Docs',
        title: 'Documentation',
        highlight: 'protocol',
        placeholder: 'Search guides and setup notes...',
      },
      categories: [
        {
          id: 'cat-1',
          title: 'Core architecture',
          iconName: 'Layers',
          count: '12 Articles',
          color: 'text-primary',
          order: 1,
        },
        {
          id: 'cat-2',
          title: 'AI integration',
          iconName: 'Cpu',
          count: '8 Articles',
          color: 'text-blue-500',
          order: 2,
        },
        {
          id: 'cat-3',
          title: 'Security',
          iconName: 'ShieldCheck',
          count: '6 Articles',
          color: 'text-green-500',
          order: 3,
        },
        {
          id: 'cat-4',
          title: 'APIs',
          iconName: 'Terminal',
          count: '15 Articles',
          color: 'text-purple-500',
          order: 4,
        },
        {
          id: 'cat-5',
          title: 'Dashboards',
          iconName: 'Zap',
          count: '24 Articles',
          color: 'text-orange-500',
          order: 5,
        },
        {
          id: 'cat-6',
          title: 'Configuration',
          iconName: 'Code2',
          count: '10 Articles',
          color: 'text-indigo-500',
          order: 6,
        },
      ],
      cta: {
        title: 'Need a guide?',
        description:
          'The docs help you understand the basics, setup, and common workflows.',
        primaryButton: 'Explore docs',
        secondaryButton: 'View GitHub',
      },
      support: [
        {
          id: 'sup-1',
          title: 'Support',
          description: 'Help when you are blocked.',
          iconName: 'MessageSquare',
          color: 'text-blue-500',
        },
        {
          id: 'sup-2',
          title: 'Status',
          description: 'Operational and monitored.',
          iconName: 'Zap',
          color: 'text-green-500',
        },
      ],
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'features',
    status: 'published',
    content: {
      header: {
        badge: 'Features',
        titlePrefix: 'What the',
        titleHighlight: 'platform does',
        description:
          'Key capabilities that support build quality, speed, and clarity.',
      },
      features: [
        {
          id: 'feat-1',
          title: 'AI-assisted work',
          description: 'Use AI where it saves time and adds value.',
          iconName: 'Cpu',
          color: 'text-primary',
          order: 1,
        },
        {
          id: 'feat-2',
          title: 'Fast delivery',
          description: 'Keep pages and apps responsive.',
          iconName: 'Globe',
          color: 'text-blue-500',
          order: 2,
        },
        {
          id: 'feat-3',
          title: 'Secure by design',
          description: 'Think about access and data handling early.',
          iconName: 'ShieldCheck',
          color: 'text-green-500',
          order: 3,
        },
        {
          id: 'feat-4',
          title: 'Modular growth',
          description: 'Build pieces that can scale with the business.',
          iconName: 'Layers',
          color: 'text-purple-500',
          order: 4,
        },
      ],
      showcase: {
        title: 'Integrated product system',
        description: 'A single workflow for content, product, and operations.',
        badgeText: 'LIVE',
        statusText: 'READY',
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'integrations',
    status: 'published',
    content: {
      header: {
        badge: 'Integrations',
        titlePrefix: 'Connect your',
        titleHighlight: 'tools',
        description:
          'Link the systems your team already uses and keep your workflow connected.',
      },
      integrations: [
        {
          id: 'int-1',
          name: 'GitHub',
          description: 'Sync code and deployment updates.',
          iconName: 'Github',
          status: 'Active',
          order: 1,
        },
        {
          id: 'int-2',
          name: 'Slack',
          description: 'Share notifications with your team.',
          iconName: 'Slack',
          status: 'Beta',
          order: 2,
        },
        {
          id: 'int-3',
          name: 'OpenAI',
          description: 'Add AI capabilities and assistants.',
          iconName: 'Bot',
          status: 'Live',
          order: 3,
        },
        {
          id: 'int-4',
          name: 'Mobile Push',
          description: 'Notify users on mobile apps.',
          iconName: 'Smartphone',
          status: 'Live',
          order: 4,
        },
      ],
      cta: {
        title: 'Need a custom integration?',
        description: 'We can connect your product to APIs and internal tools.',
        buttonText: 'Request access',
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'partners',
    status: 'published',
    content: {
      header: {
        badge: 'Partners',
        titlePrefix: 'Trusted',
        titleHighlight: 'collaborators',
        description:
          'A small group of technology partners and collaborators that strengthen delivery.',
        videoUrl: '',
      },
      partners: [
        {
          id: 'part-1',
          name: 'Neural Foundry',
          role: 'AI infrastructure',
          desc: 'Support for AI and automation workflows.',
          iconName: 'Zap',
          color: 'text-primary',
          order: 1,
        },
        {
          id: 'part-2',
          name: 'Edge Stream',
          role: 'CDN optimization',
          desc: 'Helping deliver content faster worldwide.',
          iconName: 'Globe',
          color: 'text-blue-500',
          order: 2,
        },
        {
          id: 'part-3',
          name: 'Artifact Labs',
          role: 'UI systems',
          desc: 'Design system and UI support.',
          iconName: 'Sparkles',
          color: 'text-purple-500',
          order: 3,
        },
        {
          id: 'part-4',
          name: 'Sync Security',
          role: 'Identity governance',
          desc: 'Security and access control support.',
          iconName: 'ShieldCheck',
          color: 'text-green-500',
          order: 4,
        },
      ],
      cta: {
        title: 'Want to collaborate?',
        description:
          'We are open to thoughtful partnerships that create useful products.',
        buttonText: 'Start a conversation',
        subText: 'Replies within 48 hours',
      },
      ecosystem: {
        title: 'Ecosystem',
        brands: [
          { id: 'brand-1', name: 'NEURAL' },
          { id: 'brand-2', name: 'FORGE' },
          { id: 'brand-3', name: 'EDGE' },
          { id: 'brand-4', name: 'SYNC' },
          { id: 'brand-5', name: 'VAULT' },
        ],
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'pricing',
    status: 'published',
    content: {
      header: {
        badge: 'Pricing',
        titlePrefix: 'Choose a',
        titleHighlight: 'starting point',
        description:
          'Simple pricing for launches, growth projects, and custom builds.',
        videoUrl: '',
      },
      plans: [
        {
          id: 'plan-1',
          name: 'Starter Sync',
          description: 'Good for focused landing pages and small sites.',
          price: '29',
          period: 'Month',
          features: ['Core setup', 'SEO basics', 'Responsive layout'],
          buttonText: 'Start starter',
          popular: false,
          order: 1,
        },
        {
          id: 'plan-2',
          name: 'Architect Core',
          description: 'For teams that need ongoing delivery and support.',
          price: '99',
          period: 'Month',
          features: [
            'Everything in Starter',
            'Priority support',
            'Integrations',
          ],
          buttonText: 'Choose core',
          popular: true,
          order: 2,
        },
        {
          id: 'plan-3',
          name: 'Enterprise Edge',
          description:
            'Custom systems, larger scope, and long-term partnership.',
          price: '299',
          period: 'Month',
          features: [
            'Custom architecture',
            'Dedicated support',
            'Advanced delivery',
          ],
          buttonText: 'Contact sales',
          popular: false,
          order: 3,
        },
      ],
      consultation: {
        text: 'Need something custom?',
        linkText: 'Book a consultation',
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'privacy',
    status: 'published',
    content: {
      header: {
        badge: 'Privacy',
        titlePrefix: 'How we',
        titleHighlight: 'handle data',
        description:
          'A practical explanation of how we protect and manage data.',
        videoUrl: '',
      },
      features: [
        {
          id: 'feat-1',
          title: 'Encrypted storage',
          iconName: 'Lock',
          color: 'text-blue-500',
          description: 'Sensitive data is protected in transit and at rest.',
        },
        {
          id: 'feat-2',
          title: 'Identity checks',
          iconName: 'Fingerprint',
          color: 'text-primary',
          description: 'We limit access with authentication and role checks.',
        },
        {
          id: 'feat-3',
          title: 'Controlled vaults',
          iconName: 'Database',
          color: 'text-purple-500',
          description:
            'Project assets are stored in managed systems with clear access rules.',
        },
        {
          id: 'feat-4',
          title: 'Compliance-aware work',
          iconName: 'Globe',
          color: 'text-indigo-500',
          description:
            'We keep privacy and governance in mind while designing systems.',
        },
      ],
      guarantee: {
        title: 'Trust first',
        description:
          'Our processes are designed to keep data handling understandable and secure.',
        stats: [
          { value: 'AES-256', label: 'Encryption baseline' },
          { value: '99.999%', label: 'Security focus' },
        ],
      },
      footer: {
        status: 'Privacy and security review is active.',
      },
      lastUpdated: new Date().toISOString(),
    },
  },

  {
    pageKey: 'shop',
    status: 'published',
    content: {
      seo: {
        title: `Shop | ${brandName}`,
        description:
          'Browse templates, UI kits, and digital assets designed for modern teams.',
        keywords: [
          'UI kits',
          'templates',
          'digital products',
          'website assets',
        ],
        ogImage: 'https://oftisoft.com/og/shop.jpg',
        ogTitle: `${brandName} Shop`,
        ogDescription: 'Digital products for builders and product teams.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com/shop',
      },
      header: {
        title: 'Marketplace',
        description: 'Templates, UI kits, and ready-to-use digital assets.',
      },
      categories: [
        {
          id: 'web-templates',
          name: 'Web templates',
          subcategories: ['Landing pages', 'Admin dashboards', 'Portfolios'],
          icon: 'Layout',
        },
        {
          id: 'ai-chatbots',
          name: 'AI tools',
          subcategories: ['Chatbots', 'Assistants', 'Automation'],
          icon: 'Bot',
        },
        {
          id: 'mobile-apps',
          name: 'Mobile assets',
          subcategories: ['iOS', 'Android', 'React Native'],
          icon: 'Smartphone',
        },
      ],
      products: [
        {
          id: '1',
          name: 'NeonStore UI Kit',
          slug: 'neonstore-ecommerce-ui-kit',
          description: 'A modern ecommerce UI kit.',
          price: 49,
          rating: 4.8,
          reviews: 124,
          category: 'Web templates',
          subcategory: 'Landing pages',
          image:
            'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=800&auto=format&fit=crop',
          imageAlt: 'Ecommerce product cards in a clean UI kit preview',
          tags: ['Figma', 'React Native'],
          features: ['50+ screens', 'Dark mode ready'],
          screenshots: [],
          demoUrl: '#',
          docUrl: '#',
          compatibility: ['Figma'],
          version: 'v2.1.0',
          updatePolicy: '6 months of updates',
          licenseRegular: 49,
          licenseExtended: 499,
          lastUpdated: '2026-01-15',
          faqs: [],
        },
        {
          id: '2',
          name: 'AI ChatBot Pro',
          slug: 'ai-chatbot-pro',
          description:
            'An AI chatbot template for support and knowledge bases.',
          price: 199,
          rating: 4.9,
          reviews: 85,
          category: 'AI tools',
          subcategory: 'Chatbots',
          image:
            'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=800&auto=format&fit=crop',
          imageAlt: 'Chatbot interface with support conversation panels',
          tags: ['Next.js', 'OpenAI'],
          features: ['GPT integration', 'RAG support'],
          screenshots: [],
          demoUrl: '#',
          docUrl: '#',
          compatibility: ['Next.js'],
          version: 'v1.5.2',
          updatePolicy: 'Lifetime updates',
          licenseRegular: 199,
          licenseExtended: 899,
          lastUpdated: '2026-02-01',
          faqs: [],
        },
      ],
      bundles: [
        {
          id: 'b1',
          name: 'Starter bundle',
          description: 'A bundle for launch-ready teams.',
          products: ['1', '2'],
          price: 249,
          originalPrice: 348,
          savings: 99,
          image:
            'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=800&auto=format&fit=crop',
          tags: ['Best value'],
          status: 'active',
        },
      ],
      testimonials: [
        {
          id: 't1',
          name: 'Alex Rivers',
          role: 'Developer',
          content: 'The assets were easy to adapt and saved us time.',
          rating: 5,
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
        },
      ],
      lastUpdated: new Date().toISOString(),
    },
  },
];
