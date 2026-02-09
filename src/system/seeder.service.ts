import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Project } from '../entities/project.entity';
import { Category } from '../entities/category.entity';
import { PageContent } from '../entities/page-content.entity';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import * as bcrypt from 'bcrypt';

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
        @InjectRepository(PageContent)
        private pageContentRepo: Repository<PageContent>,
        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,
        @InjectRepository(Message)
        private messageRepo: Repository<Message>,
    ) { }

    async seed() {
        this.logger.log('Initiating Architectural Data Seed...');

        await this.seedUsers();
        await this.seedCategories();
        await this.seedProducts();
        await this.seedProjects();
        await this.seedPageContent();
        await this.seedConversations();

        this.logger.log('Database Synthesis Complete.');
    }

    private async seedUsers() {
        const adminEmail = 'rasel@oftisoft.com';
        const botEmail = 'sarah@oftisoft.com';

        // Founder (Admin)
        const existingAdmin = await this.userRepo.findOne({ where: { email: adminEmail } });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('ofti_architect_2026', 10);
            const admin = this.userRepo.create({
                email: adminEmail,
                password: hashedPassword,
                name: 'Rasel Hossain',
                role: 'Admin',
                jobTitle: 'Founder & Chief Architect',
                bio: 'Passionate software engineer with 6 years of professional experience building high-fidelity digital artifacts.',
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
                isActive: true,
                isEmailVerified: true
            });
            await this.userRepo.save(admin);
            this.logger.log('Admin Node Protocol: Synced');
        }

        // Super Admin
        const superAdminEmail = 'raselhossain86666@gmail.com';
        const existingSuperAdmin = await this.userRepo.findOne({ where: { email: superAdminEmail } });
        if (!existingSuperAdmin) {
            const hashedPassword = await bcrypt.hash('Admin123@@', 10);
            const superAdmin = this.userRepo.create({
                email: superAdminEmail,
                password: hashedPassword,
                name: 'Super Admin',
                role: 'Admin',
                jobTitle: 'Super Administrator',
                bio: 'The root of all access.',
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&auto=format&fit=crop',
                isActive: true,
                isEmailVerified: true
            });
            await this.userRepo.save(superAdmin);
            this.logger.log('Super Admin Node Protocol: Synced');
        }

        // Support Bot
        const existingBot = await this.userRepo.findOne({ where: { email: botEmail } });
        if (!existingBot) {
            const bot = this.userRepo.create({
                email: botEmail,
                name: 'Sarah - Oftisoft Support',
                role: 'Support',
                jobTitle: 'Senior Support Architect',
                bio: 'Professional AI architectural support agent.',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
                isAI: true,
                isActive: true
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
                description: 'High-performance web platforms and full-stack solutions.',
                subcategories: ['WordPress', 'Next.js', 'React', 'Headless CMS', 'E-commerce']
            },
            {
                name: 'Mobile Node',
                slug: 'mobile',
                description: 'Enterprise-grade cross-platform mobile applications.',
                subcategories: ['MAUI', 'React Native', 'Flutter', 'iOS Native', 'Android Native']
            },
            {
                name: 'AI & Neural',
                slug: 'ai',
                description: 'Intelligent automation and neural chatbot agents.',
                subcategories: ['NLP', 'RAG Systems', 'Automation Bots', 'Neural Sync']
            },
            {
                name: 'DevOps & Cloud',
                slug: 'devops',
                description: 'Scaling infrastructure and automated deployment nodes.',
                subcategories: ['AWS', 'Azure', 'Kubernetes', 'CI/CD', 'Security Audits']
            }
        ];

        for (const cat of categories) {
            const existing = await this.categoryRepo.findOne({ where: { slug: cat.slug } });
            if (existing) {
                existing.name = cat.name;
                existing.description = cat.description;
                existing.subcategories = cat.subcategories;
                await this.categoryRepo.save(existing);
            } else {
                await this.categoryRepo.save(this.categoryRepo.create(cat));
            }
        }
    }

    private async seedProducts() {
        const count = await this.productRepo.count();
        if (count > 0) return;

        const products = [
            {
                name: 'Premium WordPress Ecosystem',
                slug: 'premium-wordpress',
                description: 'A hyper-scale WordPress architecture with custom-forged themes and headless CMS capability. Engineered for maximum engagement and connection.',
                price: 1499,
                category: 'web',
                subcategory: 'WordPress',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
                tags: ['Elite', 'High-Fidelity', 'Scalable'],
                features: ['Custom Visual Forge', 'Neural SEO Node', 'Edge Optimized'],
                version: 'v6.2.0',
                updatePolicy: 'Lifetime Architectural Updates',
                licenseRegular: 1499,
                licenseExtended: 4999,
                compatibility: ['PHP 8.2+', 'MySQL 8.0'],
                rating: 4.9,
                reviews: 124,
                screenshots: []
            },
            {
                name: 'Cross-Platform Mobile Node',
                slug: 'mobile-node-maui',
                description: 'Enterprise MAUI/Full-Stack mobile application framework. Sync your logic across iOS, Android, and Windows with sub-millisecond latency.',
                price: 2499,
                category: 'mobile',
                subcategory: 'MAUI',
                image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
                tags: ['Cross-Platform', 'Enterprise', 'Native Performance'],
                features: ['Unified Logic Core', 'Premium UI Kit', 'Social Node Integration'],
                version: 'v2.11.0',
                updatePolicy: 'Annual Maintenance Sync',
                licenseRegular: 2499,
                licenseExtended: 8999,
                compatibility: ['.NET 8.0', 'Visual Studio 2022'],
                rating: 4.8,
                reviews: 86,
                screenshots: []
            },
            {
                name: 'Neural AI Support Agent',
                slug: 'neural-ai-agent',
                description: 'Advanced autonomous support agent utilizing RAG and neural-sync technology. Capable of handling 90% of architectural queries in real-time.',
                price: 3499,
                category: 'ai',
                subcategory: 'Automation',
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
                tags: ['AI-Driven', 'Autonomic', 'RAG-Sync'],
                features: ['Natural Language Core', 'Legacy Data Sync', 'Self-Learning Protocol'],
                version: 'v1.4.2',
                updatePolicy: 'Monthly Neural Training Sessions',
                licenseRegular: 3499,
                licenseExtended: 12500,
                compatibility: ['Python 3.11', 'OpenAI API Node'],
                rating: 5.0,
                reviews: 42,
                screenshots: []
            },
            {
                name: 'Edge Architecture Security',
                slug: 'edge-security-shield',
                description: 'Hyper-secure firewall and audit node for enterprise cloud deployments. Verifies every logic-bit before execution.',
                price: 5999,
                category: 'devops',
                subcategory: 'Security',
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
                tags: ['Zero-Trust', 'Audit-Verified', 'Edge-Native'],
                features: ['Real-time Pulse Monitoring', 'Automated Breach-Seal', 'Quantum Encryption Node'],
                version: 'v4.0.1',
                updatePolicy: '24/7 Architectural Oversight',
                licenseRegular: 5999,
                licenseExtended: 19999,
                compatibility: ['Kubernetes', 'AWS', 'Azure'],
                rating: 4.9,
                reviews: 28,
                screenshots: []
            }
        ];

        for (const prod of products) {
            await this.productRepo.save(this.productRepo.create(prod));
        }
        this.logger.log('Service Matrix: Populated');
    }

    private async seedProjects() {
        const admin = await this.userRepo.findOne({ where: { role: 'Admin' } });
        if (!admin) return;

        const count = await this.projectRepo.count();
        if (count > 0) return;

        const projects = [
            {
                title: 'Oftisoft Global Nexus',
                description: 'Internal architectural rebuild of the main software ecosystem using NestJS and Next.js 14. Synchronizing 24+ global nodes.',
                client: 'Oftisoft Internal',
                status: 'Completed',
                progress: 100,
                budget: 25000,
                paymentStatus: 'Paid',
                userId: admin.id,
                tags: ['Internal', 'Hyper-Scale', 'NestJS']
            },
            {
                title: 'Fintech Shield Dashboard',
                description: 'A high-fidelity trading dashboard for an asset management firm, featuring real-time neural market analysis.',
                client: 'Vanguard Alpha',
                status: 'Completed',
                progress: 100,
                budget: 65000,
                paymentStatus: 'Paid',
                userId: admin.id,
                tags: ['Fintech', 'Real-time', 'Next.js']
            },
            {
                title: 'Neural CRM Implementation',
                description: 'AI-driven client relationship management hub for an enterprise logistics client, integrating 150+ API nodes.',
                client: 'Global Logistics Corp',
                status: 'In Progress',
                progress: 65,
                budget: 45000,
                paymentStatus: 'Partial',
                userId: admin.id,
                tags: ['AI', 'Enterprise', 'MAUI']
            },
            {
                title: 'E-commerce Hyper-Grid',
                description: 'Scaling a fragmented e-commerce setup into a unified headless architecture capable of 1M+ transactions per node.',
                client: 'Zenith Retail',
                status: 'Planning',
                progress: 15,
                budget: 120000,
                paymentStatus: 'Initial Deposit',
                userId: admin.id,
                tags: ['E-commerce', 'Headless', 'Big Data']
            }
        ];

        for (const proj of projects) {
            await this.projectRepo.save(this.projectRepo.create(proj));
        }
        this.logger.log('Portfolio Nodes: Initialized');
    }

    private async seedPageContent() {
        const pages = [
            {
                pageKey: 'about',
                status: 'published',
                content: {
                    seo: {
                        title: "About Oftisoft | The Future of Digital Architecture",
                        description: "We are a high-fidelity digital operative building the next generation of software experiences.",
                        keywords: ["about us", "software agency", "digital architecture", "visionaries"],
                        ogImage: "https://oftisoft.com/og/about.jpg"
                    },
                    hero: {
                        badge: "Evolution & Architecture",
                        title: "We build the",
                        highlightedWord: "meta-layer",
                        description: "Oftisoft is a hyper-scale design and development operative engineering high-fidelity artifacts for the next generation of digital builders, led by industry veteran Rasel Hossain.",
                        ctaText: "Explore Our Ecosystem",
                        cardTitle: "Global Presence Node",
                        cardDescription: "Decentralized hubs operating across dozens of zones."
                    },
                    stats: [
                        { id: "exp", label: "Years of High-Fidelity Experience", value: "6+", icon: "ShieldCheck" },
                        { id: "projects", label: "Neural Artifacts Deployed", value: "150+", icon: "Zap" },
                        { id: "clients", label: "Architect Partnerships", value: "80+", icon: "Users" }
                    ],
                    founder: {
                        name: "Rasel Hossain",
                        role: "Founder & Chief Architect",
                        tagline: "Visionary . Engineer . Consultant",
                        bioPar1: "I am Rasel Hossain, a passionate software engineer and technology consultant with 6 years of professional experience, dedicated to building modern, scalable, and high-performance digital solutions.",
                        bioPar2: "I founded Ofitsoft to bridge the gap between complex engineering and intuitive design. We provide a wide range of services including WordPress, Mobile Apps (MAUI), Backend, AI Chatbots, and DevOps—handling everything related to software solutions.",
                        stats: [
                            { num: 6, label: "Years Exp", suffix: "+" },
                            { num: 200, label: "Nodes Built", suffix: "K" },
                            { num: 100, label: "Clients", suffix: "%" }
                        ],
                        socials: { github: "https://github.com/raselhossain", linkedin: "https://linkedin.com/in/raselhossain", twitter: "https://twitter.com/raselhossain" },
                        badgeTitle: "The Architect",
                        titleLine1: "Coding the Future,",
                        titleLine2: "One Line at a Time.",
                        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
                    },
                    mission: {
                        badge: "Our DNA",
                        titleLine1: "Driven by Purpose,",
                        titleLine2: "Defined by Quality.",
                        quote: "Our mission is to empower visionaries with the technology they need to change the world. We don't just write code; we architect experiences that matter.",
                        quoteHighlight: "architect experiences"
                    },
                    values: [
                        { title: "Radical Quality", description: "Near-obsessive focus on every pixel and line of code. We don't ship artifacts; we ship perfections.", icon: "Target" },
                        { title: "Neural Innovation", description: "Leveraging the latest in AI and automation to ensure our clients stay 10 steps ahead of the curve.", icon: "Zap" },
                        { title: "Human Connection", description: "Building lasting partnerships. We operate as an extension of your own engineering operative.", icon: "Handshake" },
                        { title: "Fearless Engineering", description: "Solving complex problems with confidence. No node is too complex, no logic too deep.", icon: "ShieldCheck" }
                    ],
                    timeline: [
                        { year: "2018", title: "Genesis Node", desc: "Rasel Hossain initiates the first development protocols as a solo consultant from a small home hub.", icon: "Zap", gradient: "from-blue-600 to-cyan-400" },
                        { year: "2020", title: "Platform Expansion", desc: "Expanding into enterprise WordPress architectures and specialized MAUI mobile nodes.", icon: "Globe", gradient: "from-purple-600 to-pink-500" },
                        { year: "2023", title: "Oftisoft Synthesis", desc: "Formalizing Ofitsoft as a unified high-fidelity engineering operative with a core team of elite builders.", icon: "Rocket", gradient: "from-amber-400 to-orange-500" },
                        { year: "2026", title: "Future Forge", desc: "Leading the industry in AI-integrated development and neural sync systems, defining the meta-layer of software.", icon: "Clock", gradient: "from-emerald-500 to-cyan-500" }
                    ],
                    timelineBadge: "Our Origins",
                    timelineTitle: "Evolution of",
                    timelineTitleHighlight: "Innovation.",
                    culture: {
                        badge: "Life at Ofitsoft",
                        titleLine1: "Where Culture Meets",
                        titleLine2: "Creativity.",
                        items: [
                            { id: "1", title: "Design Sprint", location: "Oftisoft Lab 01", type: "image", size: "md:col-span-2 md:row-span-2", thumb: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" },
                            { id: "2", title: "Neural Lab", location: "Logic Zone", type: "image", size: "md:col-span-1 md:row-span-1", thumb: "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=400&auto=format&fit=crop" },
                            { id: "3", title: "Launch Protocol", location: "Main Stage", type: "video", size: "md:col-span-1 md:row-span-2", thumb: "https://images.unsplash.com/photo-1540317580384-e5d418a6293b?q=80&w=400&auto=format&fit=crop" },
                            { id: "4", title: "Architect Social", location: "Roof Hub", type: "image", size: "md:col-span-1 md:row-span-1", thumb: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop" }
                        ]
                    },
                    awardsBadge: "Hall of Fame",
                    awardsTitle: "Recognized for",
                    awardsTitleHighlight: "Digital Excellence.",
                    awardsDescription: "Our relentless pursuit of perfection has earned us accolades from the industry's most prestigious bodies.",
                    awards: [
                        { id: "a1", year: "2024", title: "Top Web Architect", org: "Clutch Global", description: "Recognized as a leading provider of high-fidelity web architectures and enterprise solutions.", gradient: "from-blue-600 to-cyan-400" },
                        { id: "a2", year: "2023", title: "Innovation Award", org: "Tech Matrix", description: "Awarded for excellence in AI-integrated mobile solutions and neural automation.", gradient: "from-purple-600 to-pink-500" },
                        { id: "a3", year: "2022", title: "Design Excellence", org: "Awwwards Node", description: "Honored for premium aesthetics, engaging user experiences, and synaptic interface speed.", gradient: "from-rose-500 to-amber-500" }
                    ],
                    team: {
                        badge: "The Collective",
                        titleLine1: "Architects of the",
                        titleLine2: "Impossible.",
                        members: [
                            { id: "m1", name: "Rasel Hossain", role: "Chief Architect", category: "Leadership", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop", gradient: "from-blue-600 to-cyan-400", socials: { github: "#", linkedin: "#", twitter: "#" } },
                            { id: "m2", name: "Sarah Jenkins", role: "UI Strategist", category: "Design", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop", gradient: "from-purple-600 to-pink-500", socials: { github: "#", linkedin: "#", twitter: "#" } },
                            { id: "m3", name: "Mike Thompson", role: "Logic Engineer", category: "Development", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop", gradient: "from-cyan-400 to-emerald-500", socials: { github: "#", linkedin: "#", twitter: "#" } },
                            { id: "m4", name: "Alex Rivera", role: "DevOps Operative", category: "Development", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&auto=format&fit=crop", gradient: "from-orange-500 to-red-500", socials: { github: "#", linkedin: "#", twitter: "#" } }
                        ]
                    },
                    cta: {
                        badge: "Join the Protocol",
                        title: "Ready to Forge Your",
                        highlight: "Digital Legacy?",
                        description: "Connect with our architectural operative today and initiate your next high-fidelity sync. Let's build the impossible.",
                        buttonText: "Initiate Sync Now"
                    }
                }
            },

            {
                pageKey: 'terms',
                status: 'published',
                content: {
                    seo: {
                        title: "Terms of Sync | Oftisoft",
                        description: "Operational governance and legal protocols for the Oftisoft ecosystem.",
                        keywords: ["terms", "legal", "governance", "protocols"],
                        ogImage: "https://oftisoft.com/og/terms.jpg"
                    },
                    header: {
                        badge: "Operational Governance",
                        title: "Terms of Sync.",
                        description: "Legal framework and architectural governance protocols for the Oftisoft ecosystem. Updated for 2026 protocols.",
                        videoUrl: ""
                    },
                    navigationRail: {
                        title: "Nexus Sections",
                        items: ["Acceptable Use Node", "Sync Obligations", "Neural Artifact Licensing", "Governance & Jurisdiction", "Fiscal Protocol"]
                    },
                    sections: [
                        {
                            id: "access",
                            title: "Platform Architecture Access",
                            iconName: "Globe",
                            content: "By initiating a sync with Oftisoft, you are granted a revocable, non-exclusive license to utilize our high-fidelity digital artifacts and development nodes. Unauthorized logic extraction is strictly prohibited."
                        },
                        {
                            id: "sovereignty",
                            title: "Neural Logic Sovereignty",
                            iconName: "Scale",
                            content: "All neural artifacts forged via our private engine remain the intellectual property of the architect (USER), unless specified in a custom deployment protocol."
                        },
                        {
                            id: "latency",
                            title: "Performance Liability",
                            iconName: "Zap",
                            content: "Oftisoft ensures 99.9% uptime for all deployed nodes. We are not liable for latency caused by external network entropy or legacy client systems."
                        }
                    ],
                    revision: {
                        prefix: "Last Governance Update:",
                        updatedAt: new Date().toLocaleDateString()
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'support',
                status: 'published',
                content: {
                    seo: {
                        title: "Support | Oftisoft",
                        description: "Architectural assistance and neural support nodes for Oftisoft clients.",
                        keywords: ["support", "help", "documentation", "contact"],
                        ogImage: "https://oftisoft.com/og/support.jpg"
                    },
                    header: {
                        badge: "Architectural Assistance Hub",
                        title: "Support Universe.",
                        searchPlaceholder: "Find architectural support nodes...",
                        videoUrl: ""
                    },
                    channels: [
                        { id: "bot", title: "Neural Chat Bot", desc: "Immediate AI assistance for architectural queries and node status monitoring.", iconName: "Bot", color: "text-primary" },
                        { id: "chat", title: "Direct Sync (Chat)", desc: "Join the real-time architect's channel for deep implementation syncs and code review.", iconName: "MessageSquare", color: "text-blue-500" },
                        { id: "docs", title: "Global SDK Docs", desc: "Exhaustive technical intelligence for independent platform mastery and node deployment.", iconName: "Terminal", color: "text-purple-500" },
                    ],
                    faq: {
                        badge: "Protocol Intelligence",
                        title: "Frequent Sync Questions",
                        items: [
                            { id: "sync", q: "How do I initiate a neural sync?", a: "Navigate to the Visual Forge in your dashboard, commit your first node artifact, and follow the deployment wizard." },
                            { id: "latency", q: "What is the global edge latency?", a: "Oftisoft utilizes a proprietary proxy matrix ensuring sub-10ms delivery for document nodes globally." },
                            { id: "billing", q: "How are architectural credits calculated?", a: "Credits are consumed based on logic-cycles and data-sync frequency. View your ledger for a detailed breakdown." }
                        ]
                    },
                    priorityRelay: {
                        title: "Priority Relay",
                        description: "Elite and Enterprise architects can initiate a high-fidelity direct sync with our core engineering operative for mission-critical deployments.",
                        buttons: [
                            { label: "Initiate Priority Sync", iconName: "Zap", variant: "default" },
                            { label: "Email Case Relay", iconName: "Mail", variant: "outline" }
                        ],
                        metrics: [
                            { id: "response", label: "Current Response Window", value: "~ 8 Minutes", iconName: "Clock" },
                            { id: "engineers", label: "Active Engineers On-Node", value: "12 Members", iconName: "CheckCircle2" }
                        ]
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'home',
                status: 'published',
                content: {
                    seo: {
                        title: 'Oftisoft - Premium Software Solutions',
                        description: 'Transform your digital vision into reality with modern, high-performance software solutions.',
                        keywords: ['software development', 'web development', 'mobile apps', 'custom software'],
                        ogImage: '/og-image.jpg',
                        ogTitle: 'Oftisoft - Premium Software Solutions',
                        ogDescription: 'Transform your digital vision into reality with modern, high-performance software solutions.',
                        twitterCard: 'summary_large_image',
                        canonicalUrl: 'https://oftisoft.com',
                    },
                    hero: {
                        id: 'hero-1',
                        title: 'Future-Ready',
                        subtitle: 'Digital Solutions.',
                        description: 'We engineer premium software experiences that redefine industries. Built for performance, scalability, and impact.',
                        badge: 'Accepting New Projects',
                        primaryCTA: { text: 'Start Project', link: '/#contact' },
                        secondaryCTA: { text: 'Showreel', link: '/portfolio' },
                        stats: [
                            { value: 150, suffix: '+', label: 'Projects Completed' },
                            { value: 98, suffix: '%', label: 'Client Satisfaction' },
                            { value: 6, suffix: 'Y', label: 'Years Experience' }
                        ],
                        subtitles: ["Digital Solutions.", "Web Architecture.", "AI Innovation.", "SaaS Platforms."],
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
                                description: 'Lightning-fast, SEO-optimized web applications built with Next.js, React, and cutting-edge frameworks.',
                                icon: 'Globe',
                                tags: ['Next.js', 'React', 'TypeScript'],
                                gradient: 'from-blue-500 to-cyan-500',
                                color: 'text-blue-400'
                            },
                            {
                                id: 'svc-2',
                                title: 'Mobile Apps',
                                description: 'Native iOS and Android apps with React Native. Beautiful, performant, and scalable.',
                                icon: 'Smartphone',
                                tags: ['React Native', 'iOS', 'Android'],
                                gradient: 'from-purple-500 to-pink-500',
                                color: 'text-purple-400'
                            },
                            {
                                id: 'svc-3',
                                title: 'AI Integration',
                                description: 'Leverage GPT-4, Claude, and custom ML models to automate workflows and enhance user experiences.',
                                icon: 'Cpu',
                                tags: ['OpenAI', 'Machine Learning', 'Automation'],
                                gradient: 'from-green-500 to-emerald-500',
                                color: 'text-green-400'
                            },
                            {
                                id: 'svc-4',
                                title: 'Cloud Infrastructure',
                                description: 'Serverless architectures on AWS, Vercel, and Cloudflare. Auto-scaling, cost-optimized, and secure.',
                                icon: 'Cloud',
                                tags: ['AWS', 'Serverless', 'DevOps'],
                                gradient: 'from-orange-500 to-red-500',
                                color: 'text-orange-400'
                            }
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
                                description: 'Real-time trading platform handling $2B+ daily volume',
                                category: 'Finance',
                                imageGradient: 'from-blue-600 via-indigo-600 to-violet-600',
                                tech: ['Next.js', 'WebSocket', 'Redis'],
                                stats: [
                                    { label: 'Users', value: '50K+' },
                                    { label: 'Uptime', value: '99.9%' }
                                ],
                                year: '2025'
                            },
                            {
                                id: 'proj-2',
                                title: 'AI Content Studio',
                                description: 'GPT-powered content generation platform for enterprises',
                                category: 'AI/ML',
                                imageGradient: 'from-purple-600 via-pink-600 to-rose-600',
                                tech: ['OpenAI', 'Python', 'FastAPI'],
                                stats: [
                                    { label: 'Generated', value: '1M+ Posts' },
                                    { label: 'Accuracy', value: '94%' }
                                ],
                                year: '2025'
                            },
                            {
                                id: 'proj-3',
                                title: 'E-Commerce Platform',
                                description: 'Headless commerce solution with AR product previews',
                                category: 'E-Commerce',
                                imageGradient: 'from-green-600 via-emerald-600 to-teal-600',
                                tech: ['Shopify', 'Three.js', 'Stripe'],
                                stats: [
                                    { label: 'Revenue', value: '$5M+' },
                                    { label: 'Conversion', value: '+45%' }
                                ],
                                year: '2024'
                            }
                        ],
                        enabled: true,
                    },
                    whyUs: {
                        id: 'whyus-1',
                        title: 'Why Visionaries',
                        subtitle: 'Choose Us.',
                        badge: 'The Ofitsoft Edge',
                        description: 'We bridge the gap between creative ambition and technical reality.',
                        features: [
                            {
                                title: 'Top 1% Talent Network',
                                description: 'Access a curated team of elite engineers, designers, and strategists. We hire only the best to ensure your product is world-class.',
                                icon: 'Users',
                                color: 'text-blue-500',
                                gradient: 'from-blue-500/20 to-blue-600/5',
                                stat: '10k+',
                                statLabel: 'Dev Hours'
                            },
                            {
                                title: 'Agile Rapid Delivery',
                                description: 'Our streamlined CI/CD pipelines and agile methodologies ensure we ship features 2x faster than traditional agencies.',
                                icon: 'Zap',
                                color: 'text-yellow-500',
                                gradient: 'from-yellow-500/20 to-orange-600/5',
                                stat: '2x',
                                statLabel: 'Faster'
                            },
                            {
                                title: 'Enterprise Architecture',
                                description: 'Built for scale from day one. We use microservices and serverless tech that can handle millions of users without breaking.',
                                icon: 'Cpu',
                                color: 'text-purple-500',
                                gradient: 'from-purple-500/20 to-indigo-600/5',
                                stat: '99.99%',
                                statLabel: 'Uptime'
                            },
                            {
                                title: 'Dedicated 24/7 Support',
                                description: 'We don\'t just launch and leave. Our global support team monitors your infrastructure around the clock for peace of mind.',
                                icon: 'Shield',
                                color: 'text-green-500',
                                gradient: 'from-green-500/20 to-emerald-600/5',
                                stat: '15min',
                                statLabel: 'Response'
                            }
                        ],
                        stats: [
                            { value: '98%', label: 'Retention' },
                            { value: '150+', label: 'Launches' },
                            { value: 'Top 3%', label: 'Global Talent' }
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
                                id: '01',
                                number: 1,
                                title: 'Discovery & Strategy',
                                description: 'We dive deep into your business goals, user needs, and market landscape to build a blueprint for success.',
                                icon: 'Search',
                                gradient: 'from-blue-500 to-cyan-500'
                            },
                            {
                                id: '02',
                                number: 2,
                                title: 'UX/UI Design',
                                description: 'Crafting intuitive, high-fidelity prototypes. We focus on user journeys that convert visitors into loyal customers.',
                                icon: 'PenTool',
                                gradient: 'from-purple-500 to-pink-500'
                            },
                            {
                                id: '03',
                                number: 3,
                                title: 'Development Sprint',
                                description: 'Agile development with weekly demos. You see progress in real-time and can course-correct instantly.',
                                icon: 'Code2',
                                gradient: 'from-green-500 to-emerald-500'
                            },
                            {
                                id: '04',
                                number: 4,
                                title: 'Testing & QA',
                                description: 'Rigorous automated and manual testing. We catch bugs before your users do.',
                                icon: 'CheckCircle2',
                                gradient: 'from-orange-500 to-red-500'
                            },
                            {
                                id: '05',
                                number: 5,
                                title: 'Launch & Scale',
                                description: 'Smooth deployment with zero downtime. Post-launch monitoring and optimization for peak performance.',
                                icon: 'Rocket',
                                gradient: 'from-pink-500 to-rose-500'
                            },
                            {
                                id: '06',
                                number: 6,
                                title: 'Growth & Support',
                                description: 'Ongoing maintenance, feature updates, and analytics-driven improvements to maximize ROI.',
                                icon: 'BarChart3',
                                gradient: 'from-cyan-500 to-blue-500'
                            }
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
                                quote: 'Ofitsoft\'s architecture handled our Black Friday traffic without a single hiccup. Absolute engineering mastery.',
                                gradient: 'from-blue-500 to-indigo-500'
                            },
                            {
                                name: 'Jessica Chen',
                                role: 'Product Lead, Nexus AI',
                                avatar: 'https://i.pravatar.cc/150?u=jessica',
                                quote: 'They didn\'t just build what we asked for. They anticipated what we needed 6 months down the line.',
                                gradient: 'from-purple-500 to-pink-500'
                            },
                            {
                                name: 'Marcus Thorne',
                                role: 'Founder, Zenith',
                                avatar: 'https://i.pravatar.cc/150?u=marcus',
                                quote: 'The level of polish in the UI/UX is unmatched. Best dev agency I\'ve worked with in a decade.',
                                gradient: 'from-green-500 to-emerald-500'
                            },
                            {
                                name: 'Sarah Jenkins',
                                role: 'Director, Creative Pulse',
                                avatar: 'https://i.pravatar.cc/150?u=sarah',
                                quote: 'Incredible attention to detail. The animations and micro-interactions make our app feel alive.',
                                gradient: 'from-orange-500 to-amber-500'
                            },
                            {
                                name: 'David Kim',
                                role: 'VP Eng, CloudScale',
                                avatar: 'https://i.pravatar.cc/150?u=david',
                                quote: 'Scalable, secure, and delivered early. Their DevOps game is strong.',
                                gradient: 'from-cyan-500 to-blue-500'
                            }
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
                            { name: 'Python', icon: 'Terminal', color: 'text-yellow-400' }
                        ],
                        enabled: true,
                    },
                    blog: {
                        id: 'blog-1',
                        title: 'Insights from the',
                        subtitle: 'Bleeding Edge.',
                        badge: 'Thought Leadership',
                        posts: [
                            {
                                id: 'post-1',
                                slug: 'ai-web-dev',
                                title: 'The Agentic Web: How AI is Rewriting the Frontend',
                                excerpt: 'Why traditional UI components are being replaced by generative interfaces that adapt to user intent in real-time.',
                                category: 'Deep Tech',
                                date: 'Oct 15, 2026',
                                readTime: '5 min',
                                gradient: 'from-blue-600 via-indigo-600 to-violet-600'
                            },
                            {
                                id: 'post-2',
                                slug: 'nextjs-optimization',
                                title: 'Server Components at Scale: Lessons from 10M Users',
                                excerpt: 'How we reduced our Next.js bundle size by 60% and achieved sub-200ms TTFB globally.',
                                category: 'Performance',
                                date: 'Sep 28, 2026',
                                readTime: '8 min',
                                gradient: 'from-purple-600 via-pink-600 to-rose-600'
                            },
                            {
                                id: 'post-3',
                                slug: 'serverless-architecture',
                                title: 'Why We Ditched Kubernetes for Serverless (And Never Looked Back)',
                                excerpt: 'The economics and developer experience of going fully serverless with Cloudflare Workers and Vercel Edge.',
                                category: 'Architecture',
                                date: 'Sep 12, 2026',
                                readTime: '6 min',
                                gradient: 'from-green-600 via-emerald-600 to-teal-600'
                            }
                        ],
                        enabled: true,
                    },
                    cta: {
                        id: 'cta-1',
                        title: 'Ready to Start Your Project?',
                        description: 'Let\'s discuss how we can help you achieve your goals.',
                        buttonLink: '/contact',
                        contactInfo: {
                            email: 'hq@oftisoft.com',
                            phone: '+1 (555) 000-0000',
                            location: 'San Francisco, CA'
                        },
                        enabled: true,
                    },

                    lastUpdated: new Date().toISOString(),
                    status: 'published',
                }
            },



            {
                pageKey: 'blog',
                status: 'published',
                content: {
                    seo: {
                        title: "Insights | Oftisoft",
                        description: "Synthesizing deep-tech insights, architectural patterns, and future design.",
                        keywords: ["blog", "insights", "tech trends", "engineering"],
                        ogImage: "https://oftisoft.com/og/blog.jpg"
                    },
                    hero: {
                        title: "Elite Engineering Editorial",
                        subtitle: "Synthesizing deep-tech insights, architectural patterns, and the future of digital product design."
                    },
                    categories: [
                        { id: "all", label: "All Insights", slug: "all", icon: "Grid" },
                        { id: "web", label: "Web Architecture", slug: "engineering", icon: "Code" },
                        { id: "mobile", label: "Mobile Node", slug: "mobile", icon: "Smartphone" },
                        { id: "ai", label: "Neural & AI", slug: "ai-data", icon: "Brain" },
                        { id: "devops", label: "Cloud & Ops", slug: "devops", icon: "Cloud" },
                        { id: "growth", label: "Growth Strategy", slug: "growth", icon: "Briefcase" },
                    ],
                    authors: [
                        {
                            id: "auth-1",
                            name: "Rasel Hossain",
                            role: "Founder & Chief Architect",
                            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop",
                            initials: "RH",
                            bio: "Founder of Oftisoft. Specialized in hyper-scale architectures and elite digital artifacts for high-vision startups.",
                            stats: [
                                { label: "Artifacts", value: "150+" },
                                { label: "Readers", value: "50k+" },
                                { label: "Neural Syncs", value: "12k+" },
                            ],
                            tags: ["Architecture", "AI", "WordPress"],
                            socials: { twitter: "#", linkedin: "#", github: "#" }
                        },
                        {
                            id: "auth-2",
                            name: "Sarah Jenkins",
                            role: "Principal UI Strategist",
                            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop",
                            initials: "SJ",
                            bio: "Leading creative direction at Oftisoft. Focuses on premium aesthetics and synaptic interface performance.",
                            stats: [
                                { label: "Designs", value: "80+" },
                                { label: "Awards", value: "12" },
                                { label: "Labs", value: "5k+" },
                            ],
                            tags: ["UI/UX", "Aesthetics", "Design Systems"],
                            socials: { twitter: "#", linkedin: "#", website: "#" }
                        }
                    ],
                    posts: [
                        {
                            id: "post-1",
                            slug: "future-web-dev-ai",
                            title: "The Agentic Web: How AI is Rewriting the Frontend Interface",
                            excerpt: "Why traditional UI components are being replaced by generative interfaces that adapt to user intent in real-time.",
                            content: `
                                <p>The landscape of web development is undergoing a fundamental shift. We are moving away from static, predefined components towards <strong>Generative Interfaces</strong> that adapt to user behavior in milliseconds.</p>
                                <h3>The Rise of AI-Native UI</h3>
                                <p>Traditional UI design focuses on "what the user might want." AI-native design focuses on "what the user is currently doing." By leveraging large language models at the edge, we can now forge components on-the-fly.</p>
                                <blockquote>"The best interface is the one that evolves with you." - Rasel Hossain</blockquote>
                                <p>At Oftisoft, we are pioneering the use of neural sync protocols to deliver these experiences with zero latency.</p>
                            `,
                            coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2665&auto=format&fit=crop",
                            category: "ai",
                            authorId: "auth-1",
                            date: "Oct 24, 2026",
                            readTime: "5 min read",
                            views: "125k",
                            featured: true,
                            popularResult: true,
                            popularRank: "01",
                            status: "published",
                            gradient: "from-blue-600 to-violet-600"
                        },
                        {
                            id: "post-2",
                            slug: "premium-mobile-architecture",
                            title: "Engineering Premium Mobile Experiences with MAUI Node",
                            excerpt: "Deep dive into how we achieve native performance and 2026 ethics in cross-platform mobile deployments.",
                            content: `
                                <p>Mobile development has often been a trade-off between speed and quality. With our <strong>MAUI Node</strong> architecture, those trade-offs are a thing of the past.</p>
                                <h3>Performance over Latency</h3>
                                <p>By utilizing a unified logic core, we ensure that every byte of data synchronized across iOS and Android is handled with enterprise security.</p>
                                <p>In this editorial, we explore the specific patterns used to minimize UI thread latency while maintaining high-fidelity visuals.</p>
                            `,
                            coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070",
                            category: "mobile",
                            authorId: "auth-1",
                            date: "Oct 18, 2026",
                            readTime: "8 min read",
                            views: "86k",
                            featured: true,
                            popularResult: true,
                            popularRank: "02",
                            status: "published",
                            gradient: "from-emerald-500 to-teal-500"
                        },
                        {
                            id: "post-3",
                            slug: "serverless-edge-compute",
                            title: "Why We Moved 90% of Our Logic to the Edge",
                            excerpt: "The latency revolution is here. A case study on shifting compute closer to the user.",
                            content: `
                                <p>Centralized servers are becoming a bottleneck for global applications. By distributing logic to edge nodes, we reduce latency to sub-10ms levels.</p>
                                <h3>The Edge Advantage</h3>
                                <p>We utilize Cloudflare Workers and Vercel Edge Functions to execute personalziation logic instantly, before the page even hydrates.</p>
                            `,
                            coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070",
                            category: "devops",
                            authorId: "auth-1",
                            date: "Oct 10, 2026",
                            readTime: "6 min read",
                            views: "54k",
                            featured: false,
                            popularResult: true,
                            popularRank: "03",
                            status: "published",
                            gradient: "from-orange-500 to-red-500"
                        },
                        {
                            id: "post-4",
                            slug: "design-systems-2026",
                            title: "Beyond Atomic Design: The Era of Organic Systems",
                            excerpt: "How design systems are evolving from rigid grids to fluid, organic layouts driven by content.",
                            content: `
                                <p>Atomic design served us well, but the future is organic. Components that breathe and adapt to their container context.</p>
                                <h3>Fluid Topology</h3>
                                <p>We are experimenting with CSS container queries and subgrid to create layouts that are truly content-aware.</p>
                            `,
                            coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000",
                            category: "web",
                            authorId: "auth-2",
                            date: "Oct 05, 2026",
                            readTime: "4 min read",
                            views: "32k",
                            featured: false,
                            popularResult: false,
                            popularRank: null,
                            status: "published",
                            gradient: "from-pink-500 to-rose-500"
                        }
                    ],
                }
            },
            {
                pageKey: 'careers',
                status: 'published',
                content: {
                    seo: {
                        title: "Careers | Oftisoft",
                        description: "Join our global operative and engineer the high-fidelity infrastructure of tomorrow.",
                        keywords: ["careers", "jobs", "tech jobs", "remote work"],
                        ogImage: "https://oftisoft.com/og/careers.jpg"
                    },
                    hero: {
                        badge: "Architectural Talent Acquisition",
                        titlePrefix: "Forge the",
                        titleHighlight: "Future",
                        titleSuffix: ".",
                        description: "Join our global operative and engineer the high-fidelity infrastructure that powers the next generation of digital design."
                    },
                    cultureValues: [
                        {
                            id: "val-1",
                            title: "Synaptic Velocity",
                            description: "We don't just build fast; we move at the speed of thought. Our engineering culture thrives on rapid iteration and high-fidelity output.",
                            iconName: "Flame",
                            color: "text-primary"
                        },
                        {
                            id: "val-2",
                            title: "Decentralized Hubs",
                            description: "Oftisoft is a borderless operative. We empower architects to build from anywhere in the world, synchronized by our global edge core.",
                            iconName: "Rocket",
                            color: "text-blue-500"
                        }
                    ],
                    jobs: [
                        {
                            id: "job-1",
                            title: "Senior Neural Engineer",
                            team: "Core Intelligence",
                            type: "Full-Time / Remote",
                            location: "Remote",
                            description: "Lead the development of our core AI reasoning engine.",
                            requirements: ["5+ years in AI/ML", "PyTorch/TensorFlow mastery", "Distributed systems experience"],
                            iconName: "Cpu",
                            color: "text-primary",
                            isActive: true
                        },
                        {
                            id: "job-2",
                            title: "Visual Systems Architect",
                            team: "Design Artifacts",
                            type: "Full-Time / SF Hub",
                            location: "San Francisco",
                            description: "Define the visual language of our next-gen interfaces.",
                            requirements: ["Strong portfolio", "Figma expert", "React/Three.js knowledge is a plus"],
                            iconName: "Sparkles",
                            color: "text-blue-500",
                            isActive: true
                        },
                        {
                            id: "job-3",
                            title: "Edge Reliability Ops",
                            team: "Infrastructure",
                            type: "Contract / Remote",
                            location: "Remote",
                            description: "Ensure 99.99% uptime for our global edge network.",
                            requirements: ["Kubernetes", "Terraform", "Go/Rust"],
                            iconName: "Globe",
                            color: "text-green-500",
                            isActive: true
                        },
                        {
                            id: "job-4",
                            title: "Headless Framework Lead",
                            team: "Development",
                            type: "Full-Time / Remote",
                            location: "Remote",
                            description: "Build the SDKs that developers love to use.",
                            requirements: ["TypeScript patterns", "Open source maintainer experience"],
                            iconName: "Terminal",
                            color: "text-purple-500",
                            isActive: true
                        },
                    ],
                    contact: {
                        title: "Don't see your node?",
                        description: "If you're a high-fidelity engineer or visual architect, initiate a direct sync. We're always expanding.",
                        buttonText: "Direct Sync (Speculative)"
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'changelog',
                status: 'published',
                content: {
                    seo: {
                        title: "Changelog | Oftisoft",
                        description: "Tracking the architectural development and platform iterative cycles.",
                        keywords: ["changelog", "updates", "releases", "versions"],
                        ogImage: "https://oftisoft.com/og/changelog.jpg"
                    },
                    header: {
                        badge: "Evolution Log",
                        titlePrefix: "Changelog",
                        titleSuffix: ".",
                        description: "Tracking the architectural development and platform iterative cycles of the Oftisoft ecosystem."
                    },
                    updates: [
                        {
                            id: "v2.4.0",
                            version: "v2.4.0",
                            date: "Feb 05, 2026",
                            title: "Neural Engine Integration",
                            description: "Implemented a new core processing engine with sub-10ms response times for all AI-driven artifacts.",
                            category: "Major",
                            changes: [
                                "Introduced Headless Forge for rapid component deployment.",
                                "Visual editor now supports real-time multi-device simulation.",
                                "Optimized global edge distribution protocols.",
                                "Added support for 2026 aesthetics design tokens."
                            ],
                            iconName: "Sparkles",
                            isActive: true
                        },
                        {
                            id: "v2.3.5",
                            version: "v2.3.5",
                            date: "Jan 28, 2026",
                            title: "Financial Infrastructure Hardening",
                            description: "Significant upgrades to the billing and settlement system for multi-regional support.",
                            category: "Update",
                            changes: [
                                "Enhanced MFA protocols for admin finance dashboards.",
                                "Integrated cross-border fiscal reconciliation nodes.",
                                "Improved PDF generation latency for invoices."
                            ],
                            iconName: "ShieldCheck",
                            isActive: true
                        },
                        {
                            id: "v2.3.0",
                            version: "v2.3.0",
                            date: "Jan 15, 2026",
                            title: "Marketplace Expansion",
                            description: "Launching the new category matrix for bespoke development services.",
                            category: "Feature",
                            changes: [
                                "Added service request quotes and proposal tracking.",
                                "Unified digital library interface for asset management.",
                                "New glassmorphic UI kit for e-commerce artifacts."
                            ],
                            iconName: "Box",
                            isActive: true
                        }
                    ],
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'community',
                status: 'published',
                content: {
                    seo: {
                        title: "Community | Oftisoft",
                        description: "Join the global grid of architects, neural engineers, and visual designers.",
                        keywords: ["community", "discord", "developers", "network"],
                        ogImage: "https://oftisoft.com/og/community.jpg"
                    },
                    header: {
                        badge: "Social Intelligence Hub",
                        title: "Community",
                        highlight: "Nexus",
                        description: "Join the global grid of architects, neural engineers, and visual designers building the meta-layer of 2026."
                    },
                    links: [
                        {
                            id: "link-1",
                            title: "GitHub OSS",
                            label: "Contribute to core artifacts",
                            iconName: "Github",
                            color: "text-white",
                            url: "https://github.com",
                            isActive: true
                        },
                        {
                            id: "link-2",
                            title: "Discord Hub",
                            label: "Real-time architect sync",
                            iconName: "MessageSquare",
                            color: "text-indigo-400",
                            url: "https://discord.com",
                            isActive: true
                        },
                        {
                            id: "link-3",
                            title: "Slack Matrix",
                            label: "Enterprise developer signal",
                            iconName: "Slack",
                            color: "text-blue-400",
                            url: "https://slack.com",
                            isActive: true
                        },
                        {
                            id: "link-4",
                            title: "X Protocol",
                            label: "Platform evolution stream",
                            iconName: "Twitter",
                            color: "text-blue-500",
                            url: "https://twitter.com",
                            isActive: true
                        },
                    ],
                    newsletter: {
                        title: "Neural Digest",
                        description: "Receive high-fidelity platform updates, weekly artifact drops, and architectural intelligence nodes directly to your inbox.",
                        placeholder: "Enter secure email interface...",
                        buttonText: "Initiate Sync",
                        footerText: "Trusted by 14k+ Global Architects"
                    },
                    stats: [
                        { id: "stat-1", value: "4.8k+", label: "Sync Nodes Active", order: 1 },
                        { id: "stat-2", value: "1.2m", label: "Artifact Pulls", order: 2 },
                        { id: "stat-3", value: "100+", label: "OSS Contributors", order: 3 },
                    ],
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'contact',
                status: 'published',
                content: {
                    seo: {
                        title: "Contact | Oftisoft",
                        description: "Connect with our architectural core for bespoke implementations.",
                        keywords: ["contact", "hire us", "consultation", "support"],
                        ogImage: "https://oftisoft.com/og/contact.jpg"
                    },
                    header: {
                        badge: "Communication Interface",
                        titlePrefix: "Initiate",
                        titleHighlight: "Sync",
                        titleSuffix: ".",
                        description: "Connect with our architectural core for bespoke implementations, system consultations, or infrastructure support."
                    },
                    contactInfo: [
                        { id: "info-1", title: "Global Headquarters", value: "San Francisco, CA / Distributed Hubs", iconName: "MapPin", color: "text-blue-500", order: 1 },
                        { id: "info-2", title: "Secure Email Sync", value: "hq@oftisoft.com", iconName: "Mail", color: "text-primary", order: 2 },
                        { id: "info-3", title: "Arch: Support Node", value: "support.oftisoft.com", iconName: "Headset", color: "text-green-500", order: 3 },
                    ],
                    statusNode: {
                        title: "Support Node Sync",
                        status: "ACTIVE",
                        latencyText: "Current artifact deployment latency is sub-10s across all global edge proxies."
                    },
                    form: {
                        title: "Transmission Node",
                        description: "Construct your communication payload below and commit to our primary processing core.",
                        nameLabel: "Identity Token (Name)",
                        emailLabel: "Communication Proxy (Email)",
                        subjectLabel: "Request Subject Node",
                        messageLabel: "Context Payload (Message)",
                        buttonText: "Commit Transmission"
                    },
                    footer: {
                        encryptedText: "P2P Encrypted Data Transfer Protocols ACTIVE",
                        agentText: "Neural Processing Agents Dispatched on Commit"
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'docs',
                status: 'published',
                content: {
                    seo: {
                        title: "Documentation | Oftisoft",
                        description: "Technical intelligence for independent platform mastery and node deployment.",
                        keywords: ["documentation", "docs", "api", "sdk"],
                        ogImage: "https://oftisoft.com/og/docs.jpg"
                    },
                    header: {
                        badge: "Intelligence Repositorium",
                        title: "Documentation",
                        highlight: "Protocol",
                        placeholder: "Find architectural intelligence nodes..."
                    },
                    categories: [
                        { id: "cat-1", title: "Core Architectural Nodes", iconName: "Layers", count: "12 Articles", color: "text-primary", order: 1 },
                        { id: "cat-2", title: "Neural Forge Integration", iconName: "Cpu", count: "8 Articles", color: "text-blue-500", order: 2 },
                        { id: "cat-3", title: "Identity & Security Governance", iconName: "ShieldCheck", count: "6 Articles", color: "text-green-500", order: 3 },
                        { id: "cat-4", title: "Global SDK & Protocols", iconName: "Terminal", count: "15 Articles", color: "text-purple-500", order: 4 },
                        { id: "cat-5", title: "Dashboard Implementation", iconName: "Zap", count: "24 Articles", color: "text-orange-500", order: 5 },
                        { id: "cat-6", title: "API Configuration Engine", iconName: "Code2", count: "10 Articles", color: "text-indigo-500", order: 6 },
                    ],
                    cta: {
                        title: "Advanced SDK Guides",
                        description: "Unlock the full architectural potential of your development environment with our hyper-scaled SDK documentation nodes.",
                        primaryButton: "Explore SDK Repo",
                        secondaryButton: "View GitHub"
                    },
                    support: [
                        { id: "sup-1", title: "Support Node ACTIVE", description: "Direct architectural assistance protocols.", iconName: "MessageSquare", color: "text-blue-500" },
                        { id: "sup-2", title: "Status Operational", description: "99.99% Node uptime across all proxies.", iconName: "Zap", color: "text-green-500" }
                    ],
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'features',
                status: 'published',
                content: {
                    seo: {
                        title: "Features | Oftisoft",
                        description: "Engineer high-fidelity digital experiences with our suite of modern tools.",
                        keywords: ["features", "capabilities", "platform", "tools"],
                        ogImage: "https://oftisoft.com/og/features.jpg"
                    },
                    header: {
                        badge: "Core Capabilities Matrix",
                        titlePrefix: "Platform",
                        titleHighlight: "Features",
                        description: "Engineer high-fidelity digital experiences with our suite of modern development tools and architectural nodes."
                    },
                    features: [
                        {
                            id: "feat-1",
                            title: "Neural Artifact Generation",
                            description: "Deploy production-grade code snippets and UI components using our proprietary neural engine with 2026 aesthetics.",
                            iconName: "Cpu",
                            color: "text-primary",
                            order: 1
                        },
                        {
                            id: "feat-2",
                            title: "Global Edge Distribution",
                            description: "All digital assets and documentation nodes are served via our high-speed global proxy for sub-10s latency.",
                            iconName: "Globe",
                            color: "text-blue-500",
                            order: 2
                        },
                        {
                            id: "feat-3",
                            title: "Hyper-Secure Protocol",
                            description: "Advanced MFA and identity governance built into every development node to protect your professional artifacts.",
                            iconName: "ShieldCheck",
                            color: "text-green-500",
                            order: 3
                        },
                        {
                            id: "feat-4",
                            title: "Headless Forge Integration",
                            description: "Scale your projects with a modular, headless architecture that adapts to any modern framework.",
                            iconName: "Layers",
                            color: "text-purple-500",
                            order: 4
                        }
                    ],
                    showcase: {
                        title: "Integrated Visual Forge",
                        description: "Real-time multi-device simulation and artifact deployment.",
                        badgeText: "OPERATIONAL",
                        statusText: "SUDO SYNC --NODES ACTIVE"
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'integrations',
                status: 'published',
                content: {
                    seo: {
                        title: "Integrations | Oftisoft",
                        description: "Connect your Oftisoft environment with the world's most powerful developer tools.",
                        keywords: ["integrations", "plugins", "connections", "api"],
                        ogImage: "https://oftisoft.com/og/integrations.jpg"
                    },
                    header: {
                        badge: "Global Interoperability Hub",
                        titlePrefix: "Integrations",
                        titleHighlight: "Matrix",
                        description: "Connect your Oftisoft environment with the world's most powerful developer tools and neural services."
                    },
                    integrations: [
                        {
                            id: "int-1",
                            name: "GitHub Protocol",
                            description: "Instant sync with your repository pipelines for continuous artifact deployment.",
                            iconName: "Github",
                            status: "Active",
                            order: 1
                        },
                        {
                            id: "int-2",
                            name: "Slack Signal",
                            description: "Real-time notifications for proposal activations and delivery status updates.",
                            iconName: "Slack",
                            status: "Beta",
                            order: 2
                        },
                        {
                            id: "int-3",
                            name: "OpenAI Neural",
                            description: "Powering the core intelligence of your bot templates and RAG systems.",
                            iconName: "Bot",
                            status: "Live",
                            order: 3
                        },
                        {
                            id: "int-4",
                            name: "Mobile Edge",
                            description: "Dedicated push-sync for cross-platform application frameworks.",
                            iconName: "Smartphone",
                            status: "Live",
                            order: 4
                        },
                    ],
                    cta: {
                        title: "Custom API Access",
                        description: "Building something unique? Access our full neural API suite and forge your own custom integrations.",
                        buttonText: "Request API Access Node"
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'partners',
                status: 'published',
                content: {
                    seo: {
                        title: "Partners | Oftisoft",
                        description: "Collaborating with the world's most innovative neural operatives.",
                        keywords: ["partners", "alliance", "ecosystem", "collaborators"],
                        ogImage: "https://oftisoft.com/og/partners.jpg"
                    },
                    header: {
                        badge: "Global Alliance Matrix",
                        titlePrefix: "Strategic",
                        titleHighlight: "Partners",
                        description: "Collaborating with the world's most innovative neural operatives to expand the Oftisoft architectural meta-layer.",
                        videoUrl: ""
                    },
                    partners: [
                        {
                            id: "part-1",
                            name: "Neural Foundry",
                            role: "Intelligence Infrastructure",
                            desc: "Collaborating on the core RAG engines that power Oftisoft's visual forge.",
                            iconName: "Zap",
                            color: "text-primary",
                            order: 1
                        },
                        {
                            id: "part-2",
                            name: "Edge Stream",
                            role: "CDN Optimization",
                            desc: "Ensuring sub-10ms delivery of development artifacts across 48+ global zones.",
                            iconName: "Globe",
                            color: "text-blue-500",
                            order: 2
                        },
                        {
                            id: "part-3",
                            name: "Artifact Labs",
                            role: "UI Kit Distribution",
                            desc: "Primary contributor to our baseline 2026 aesthetics and primitive UI nodes.",
                            iconName: "Sparkles",
                            color: "text-purple-500",
                            order: 3
                        },
                        {
                            id: "part-4",
                            name: "Sync Security",
                            role: "Identity Governance",
                            desc: "Powering the hyper-secure MFA and biometric neural verification protocols.",
                            iconName: "ShieldCheck",
                            color: "text-green-500",
                            order: 4
                        }
                    ],
                    cta: {
                        title: "Join the Alliance.",
                        description: "Are you building the next generation of neural design tools or high-fidelity development infrastructure? Sync with our partnership core.",
                        buttonText: "Initiate Partnership Node",
                        subText: "Alliance Sync Response: Sub-48h Cycle"
                    },
                    ecosystem: {
                        title: "Synchronized Ecosystem Operatives",
                        brands: [
                            { id: "brand-1", name: "NEURAL" },
                            { id: "brand-2", name: "FORGE" },
                            { id: "brand-3", name: "EDGE" },
                            { id: "brand-4", name: "SYNC" },
                            { id: "brand-5", name: "VAULT" }
                        ]
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'portfolio',
                status: 'published',
                content: {
                    seo: {
                        title: "Portfolio | Oftisoft",
                        description: "Explore our portfolio of award-winning applications and systems.",
                        keywords: ["portfolio", "work", "projects", "case studies"],
                        ogImage: "https://oftisoft.com/og/portfolio.jpg"
                    },
                    header: {
                        badge: "World Class Engineering",
                        title: "Success Stories",
                        description: "We build digital products that scale. Explore our portfolio of award-winning applications and systems.",
                        videoUrl: ""
                    },
                    projects: [
                        {
                            id: "proj-1",
                            title: "EcoSmart E-commerce",
                            category: "Ecommerce",
                            image: "https://images.unsplash.com/photo-1523474253062-5e4ead0d166d?q=80&w=800&auto=format&fit=crop",
                            tags: ["Next.js", "Stripe", "Tailwind", "Redis"],
                            description: "A sustainable fashion marketplace with real-time inventory.",
                            longDescription: "EcoSmart is a pioneering e-commerce platform dedicated to sustainable fashion. We engineered a real-time inventory system using Redis and developed a personalized recommendation engine that increased conversion rates by 40%.",
                            client: "EcoLife Inc.",
                            stats: [{ label: "ROI", value: "250%" }, { label: "Sales", value: "$2M+" }],
                            gradient: "from-emerald-500/20 to-teal-500/20"
                        },
                        {
                            id: "proj-2",
                            title: "FinTech Analytics Core",
                            category: "Enterprise",
                            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
                            tags: ["React", "D3.js", "Node.js", "GraphQL"],
                            description: "High-performance dashboard processing millions of transactions.",
                            longDescription: "Built for high-frequency trading firms, this dashboard visualizes millions of data points in real-time without rendering lag. Utilizes WebWorkers and canvas-based rendering for maximum performance.",
                            client: "FinanceFlow",
                            stats: [{ label: "Latency", value: "<50ms" }, { label: "Users", value: "50k" }],
                            gradient: "from-blue-600/20 to-indigo-600/20"
                        },
                        {
                            id: "proj-3",
                            title: "Nexus AI Assistant",
                            category: "AI",
                            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
                            tags: ["Python", "LangChain", "FastAPI", "Pinecone"],
                            description: "Customer service automation handling 80% of inquiries.",
                            longDescription: "A context-aware AI agent that integrates with existing helpdesk categories. It uses RAG (Retrieval Augmented Generation) to provide accurate answers based on company knowledge bases.",
                            client: "TechHelp",
                            stats: [{ label: "Automation", value: "80%" }, { label: "Cost Saving", value: "40%" }],
                            gradient: "from-purple-600/20 to-pink-600/20"
                        },
                        {
                            id: "proj-4",
                            title: "Nomad Travel App",
                            category: "Mobile",
                            image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop",
                            tags: ["React Native", "Firebase", "Google Maps"],
                            description: "Cross-platform mobile app for offline travel planning.",
                            longDescription: "Designed for digital nomads, this app features robust offline-first architecture. Syncs data automatically when connection is restored, ensuring seamless travel planning in remote areas.",
                            client: "GoTravel",
                            stats: [{ label: "Downloads", value: "100k+" }, { label: "Rating", value: "4.8" }],
                            gradient: "from-orange-500/20 to-yellow-500/20"
                        },
                        {
                            id: "proj-5",
                            title: "MediCare Portal",
                            category: "Enterprise",
                            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
                            tags: ["Next.js", "PostgreSQL", "HIPAA", "Docker"],
                            description: "Secure patient management system for hospital networks.",
                            longDescription: "A HIPAA-compliant platform connecting patients with doctors. Features end-to-end encryption for all medical records and a highly accessible UI for elderly patients.",
                            client: "MediCare",
                            stats: [{ label: "Efficiency", value: "+45%" }, { label: "Security", value: "100%" }],
                            gradient: "from-cyan-500/20 to-blue-500/20"
                        },
                        {
                            id: "proj-6",
                            title: "Chronos Luxury",
                            category: "Web",
                            image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
                            tags: ["GSAP", "Three.js", "WebGL", "Blender"],
                            description: "Award-winning immersive 3D website for luxury watches.",
                            longDescription: "To capturing the craftsmanship of luxury timepieces, we built a fully 3D interactive product showcase using Three.js and WebGL. The result is a showroom experience in the browser.",
                            client: "Chronos",
                            stats: [{ label: "Traffic", value: "500k" }, { label: "Awards", value: "3" }],
                            gradient: "from-amber-600/20 to-red-600/20"
                        }
                    ],
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'pricing',
                status: 'published',
                content: {
                    seo: {
                        title: "Pricing | Oftisoft",
                        description: "Secure high-fidelity development artifacts and architectural support.",
                        keywords: ["pricing", "plans", "subscription", "cost"],
                        ogImage: "https://oftisoft.com/og/pricing.jpg"
                    },
                    header: {
                        badge: "Fiscal Investment Matrix",
                        titlePrefix: "Pricing",
                        titleHighlight: "Protocol",
                        description: "Secure high-fidelity development artifacts and architectural support via our subscription nodes.",
                        videoUrl: ""
                    },
                    plans: [
                        {
                            id: "plan-1",
                            name: "Starter Sync",
                            description: "Perfect for individual builders and rapid prototyping.",
                            price: "29",
                            period: "MoonCycle",
                            features: [
                                "Access to 5 Premium UI Kits",
                                "Next.js 15 Starter Templates",
                                "Basic Community Support",
                                "Global Edge Distribution",
                                "2026 Aesthetic Design Tokens"
                            ],
                            buttonText: "Initiate Starter Node",
                            popular: false,
                            order: 1
                        },
                        {
                            id: "plan-2",
                            name: "Architect Core",
                            description: "Professional grade tools for established development operations.",
                            price: "99",
                            period: "MoonCycle",
                            features: [
                                "All-Access Asset Library",
                                "Neural Engine Priority Access",
                                "24/7 Architectural Support",
                                "Custom API Key Deployment",
                                "Advanced Identity Governance",
                                "Multi-Tenant SaaS Kits"
                            ],
                            buttonText: "Activate Core Node",
                            popular: true,
                            order: 2
                        },
                        {
                            id: "plan-3",
                            name: "Enterprise Edge",
                            description: "Bespoke infrastructure solutions for hyper-scale enterprises.",
                            price: "299",
                            period: "MoonCycle",
                            features: [
                                "White-Label Implementation",
                                "Private Edge Proxy Setup",
                                "Dedicated Engineer Support",
                                "Custom RAG System Forge",
                                "Infinite Scale Guarantees",
                                "On-Premise Deployment Ops"
                            ],
                            buttonText: "Request Enterprise Sync",
                            popular: false,
                            order: 3
                        }
                    ],
                    consultation: {
                        text: "Need a custom deployment configuration?",
                        linkText: "Initiate Consultation Node"
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'privacy',
                status: 'published',
                content: {
                    seo: {
                        title: "Privacy Protocol | Oftisoft",
                        description: "High-fidelity data governance and identity protection protocols.",
                        keywords: ["privacy", "policy", "security", "data"],
                        ogImage: "https://oftisoft.com/og/privacy.jpg"
                    },
                    header: {
                        badge: "Intelligence Protection Node",
                        titlePrefix: "Privacy",
                        titleHighlight: "Protocol",
                        description: "High-fidelity data governance and identity protection protocols for the Oftisoft architect community.",
                        videoUrl: ""
                    },
                    features: [
                        {
                            id: "feat-1",
                            title: "Zero-Knowledge Sync",
                            iconName: "Lock",
                            color: "text-blue-500",
                            description: "Our global proxies utilize zero-knowledge architecture to ensure your professional artifacts remain private during node transmission."
                        },
                        {
                            id: "feat-2",
                            title: "Identity Fingerprinting",
                            iconName: "Fingerprint",
                            color: "text-primary",
                            description: "Advanced MFA and biometric neural verification protect your administrative access to the platform's core-nodes."
                        },
                        {
                            id: "feat-3",
                            title: "Encrypted Data Vaults",
                            iconName: "Database",
                            color: "text-purple-500",
                            description: "All project intelligence and digital artifacts are stored in distributed, P2P encrypted repositories across our edge network."
                        },
                        {
                            id: "feat-4",
                            title: "Anonymous Intelligence",
                            iconName: "Eye",
                            color: "text-green-500",
                            description: "We anonymize all neural training inputs to prevent the extraction of proprietary logic from your bespoke implementations."
                        },
                        {
                            id: "feat-5",
                            title: "Edge Security Proxy",
                            iconName: "Server",
                            color: "text-orange-500",
                            description: "Sub-10ms secure tunneling for all visual engine previews and multi-device simulation requests."
                        },
                        {
                            id: "feat-6",
                            title: "Governance Compliance",
                            iconName: "Globe",
                            color: "text-indigo-500",
                            description: "Oftisoft operates in full alignment with global data sovereignty frameworks including GDPR, CCPA, and 2026 Digital Acts."
                        },
                    ],
                    guarantee: {
                        title: "Trust the Core.",
                        description: "Our commitment to professional privacy is encoded into the very logic-nodes of the Oftisoft engine. We don't just protect data; we engineer trust into the foundation of your digital ecosystem.",
                        stats: [
                            { value: "AES-256-X", label: "Baseline Encryption" },
                            { value: "99.999%", label: "Identity Security" }
                        ]
                    },
                    footer: {
                        status: "Digital Privacy Sync Status: OPERATIONAL / 2026.4.2"
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'services',
                status: 'published',
                content: {
                    seo: {
                        title: "Services | Oftisoft",
                        description: "Future-proof web architecture, mobile apps, and AI integration.",
                        keywords: ["services", "solutions", "offerings", "expertise"],
                        ogImage: "https://oftisoft.com/og/services.jpg"
                    },
                    heroVideoUrl: "",
                    overview: [
                        {
                            id: "web",
                            label: "Modern Web",
                            iconName: "Globe",
                            gradient: "from-blue-600 to-cyan-500",
                            title: "High-Performance Web Applications",
                            subtitle: "Future-Proof Web Architecture",
                            description: "We build pixel-perfect, SEO-optimized web applications using Next.js 15 and React Server Components. Our sites aren't just beautiful; they are lightning fast and score 100 on Core Web Vitals.",
                            features: [
                                { iconName: "Zap", title: "Speed Optimization", desc: "Sub-second load times and interaction to next paint (INP) optimization." },
                                { iconName: "Globe", title: "Edge Scalability", desc: "Global distribution for near-zero latency worldwide." },
                                { iconName: "Layers", title: "Modular Architecture", desc: "Service-oriented structure for effortless scaling." },
                                { iconName: "ShieldCheck", title: "Enterprise Security", desc: "Advanced protection mechanisms and data privacy compliance." }
                            ],
                            techs: ["Next.js 15", "React Server Components", "TypeScript", "Tailwind CSS", "Framer Motion", "Vercel Edge"],
                            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
                        },
                        {
                            id: "mobile",
                            label: "Mobile Apps",
                            iconName: "Smartphone",
                            gradient: "from-purple-600 to-pink-500",
                            title: "Native iOS & Android Experiences",
                            subtitle: "Cross-Platform Excellence",
                            description: "Deliver stunning native mobile experiences using React Native and MAUI. We create apps that feel fluid, responsive, and completely at home on any device.",
                            features: [
                                { iconName: "Smartphone", title: "Native Performance", desc: "Compiling to native code for maximum frame rates and responsiveness." },
                                { iconName: "RefreshCcw", title: "Unified Codebase", desc: "Share up to 90% of code between platforms to reduce maintenance costs." },
                                { iconName: "Bell", title: "Push Notifications", desc: "Integrated engagement loops to keep users coming back." },
                                { iconName: "WifiOff", title: "Offline-First", desc: "Robust data synchronization for when connectivity is spotty." }
                            ],
                            techs: ["React Native", "Flutter", "MAUI", "Swift", "Kotlin", "Firebase"],
                            image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop"
                        },
                        {
                            id: "ai",
                            label: "AI Solutions",
                            iconName: "Cpu",
                            gradient: "from-green-600 to-emerald-500",
                            title: "Neural Integration & Automation",
                            subtitle: "The Intelligence Layer",
                            description: "Infuse your products with the power of artificial intelligence. From custom RAG chatbots to predictive analytics, we help you leverage the latest in machine learning.",
                            features: [
                                { iconName: "Bot", title: "Custom Agents", desc: "Tailored AI assistants trained on your proprietary data." },
                                { iconName: "Search", title: "Semantic Search", desc: "Understand user intent beyond simple keyword matching." },
                                { iconName: "BarChart", title: "Predictive Analytics", desc: "Forecast trends and behaviors using historical data models." },
                                { iconName: "Zap", title: "Workflow Automation", desc: "Auto-pilot for your most repetitive business processes." }
                            ],
                            techs: ["OpenAI", "LangChain", "Python", "FastAPI", "Pinecone", "HuggingFace"],
                            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop"
                        },
                        {
                            id: "devops",
                            label: "DevOps & Cloud",
                            iconName: "Cloud",
                            gradient: "from-orange-500 to-red-500",
                            title: "Scalable Infrastructure Architecture",
                            subtitle: "Reliability at Scale",
                            description: "Sleep soundly knowing your infrastructure can handle any traffic spike. We design self-healing, auto-scaling cloud architectures on AWS, Azure, and Vercel.",
                            features: [
                                { iconName: "Server", title: "Serverless Compute", desc: "Pay only for what you use with infinite scaling capabilities." },
                                { iconName: "Container", title: "Docker & K8s", desc: "Containerized deployments for consistent environments everywhere." },
                                { iconName: "Shield", title: "Security Audits", desc: "Regular penetration testing and vulnerability scanning." },
                                { iconName: "Activity", title: "24/7 Monitoring", desc: "Real-time alerts and automated incident response protocols." }
                            ],
                            techs: ["AWS", "Terraform", "Docker", "Kubernetes", "GitHub Actions", "Prometheus"],
                            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop"
                        }
                    ],
                    comparison: {
                        features: [
                            { name: "Custom Design", tooltip: "Tailored UI/UX specifically for your brand" },
                            { name: "SEO Optimization", tooltip: "Advanced technical SEO setup" },
                            { name: "CMS Integration", tooltip: "Easy content management" },
                            { name: "E-commerce", tooltip: "Full shopping cart & checkout" },
                            { name: "API Integration", tooltip: "Connect 3rd party services" },
                            { name: "Database Setup", tooltip: "Scalable data architecture" },
                            { name: "Maintenance", tooltip: "Ongoing support duration" },
                            { name: "Source Code", tooltip: "Full ownership of codebase" }
                        ],
                        tiers: [
                            {
                                id: "starter", name: "Starter", price: "$2,999", description: "Perfect for landing pages and small business sites.", iconName: "Zap", color: "text-blue-500", highlight: false, features: [true, true, true, false, false, false, "1 Month", false]
                            },
                            {
                                id: "growth", name: "Growth", price: "$5,499", description: "Ideal for growing startups and e-commerce brands.", iconName: "Sparkles", color: "text-purple-500", highlight: true, features: [true, true, true, true, true, true, "3 Months", true]
                            },
                            {
                                id: "enterprise", name: "Enterprise", price: "Custom", description: "Full-scale solution for large organizations.", iconName: "Crown", color: "text-orange-500", highlight: false, features: [true, true, true, true, true, true, "12 Months", true]
                            }
                        ]
                    },
                    packages: [
                        {
                            id: "starter", name: "Starter", price: 2999, monthlyPrice: 299, description: "Perfect for landing pages and small business websites.", features: ["Custom Design", "Mobile Responsive", "SEO Optimized", "CMS Integration", "1 Month Support"], highlight: false, iconName: "Rocket", gradient: "from-blue-500/20 to-cyan-500/20"
                        },
                        {
                            id: "growth", name: "Growth", price: 5499, monthlyPrice: 599, description: "Ideal for growing startups and e-commerce brands.", features: ["Everything in Starter", "Shopping Cart", "Payment Gateway", "User Authentication", "3 Months Support", "Analytics Dashboard"], highlight: true, iconName: "Sparkles", gradient: "from-purple-500/20 to-pink-500/20"
                        },
                        {
                            id: "enterprise", name: "Enterprise", price: "Custom", monthlyPrice: "Custom", description: "Full-scale solution for large organizations.", features: ["Everything in Growth", "Custom API Integration", "Cloud Infrastructure", "Advanced Security", "12 Months Support", "Dedicated Project Manager"], highlight: false, iconName: "Crown", gradient: "from-orange-500/20 to-red-500/20"
                        }
                    ],
                    process: [
                        { id: 1, title: "Discovery & Strategy", desc: "We start by understanding your vision, target audience, and technical requirements. We deliver a detailed project roadmap and technical specifications.", iconName: "Video", color: "text-blue-500" },
                        { id: 2, title: "UX/UI Design", desc: "Our designers create high-fidelity interactive prototypes. We focus on user journey mapping and creating a visual identity that resonates with your brand.", iconName: "FileText", color: "text-purple-500" },
                        { id: 3, title: "Agile Development", desc: "Development happens in 2-week sprints with regular updates. You get access to a staging environment to see progress in real-time.", iconName: "Code2", color: "text-yellow-500" },
                        { id: 4, title: "Quality Assurance", desc: "Rigorous testing across devices and browsers. We perform security audits, performance benchmarking, and accessibility checks.", iconName: "ClipboardCheck", color: "text-red-500" },
                        { id: 5, title: "Launch & Training", desc: "Seamless deployment to your production environment. We provide training sessions and documentation for your team to manage the platform.", iconName: "Rocket", color: "text-green-500" },
                        { id: 6, title: "Evolution", desc: "Post-launch monitoring and iterative improvements based on user data. We ensure your product stays ahead of the curve.", iconName: "HeartPulse", color: "text-cyan-500" }
                    ],
                    startId: 1,
                    faqs: [
                        { id: "timeline", category: "General", question: "How long does a typical project take?", answer: "Timeline depends on complexity. A simple website takes 2-4 weeks, while a complex web app can take 2-4 months. We provide a detailed Gantt chart during the onboarding phase so you always know what to expect." },
                        { id: "hosting", category: "Technical", question: "Do you provide hosting services?", answer: "We typically set up hosting for you on industry-standard platforms like AWS, Vercel, or DigitalOcean. You retain full ownership of the accounts. We can also manage the infrastructure for a monthly maintenance fee." },
                        { id: "payment", category: "Billing", question: "What is your payment structure?", answer: "We work on a milestone basis to ensure trust. Typically, it's 40% upfront to kickstart resources, 30% after the design phase approval, and 30% upon final delivery and deployment." },
                        { id: "redesign", category: "General", question: "Can you update my existing website?", answer: "Yes! We specialize in modernization. We can refactor your legacy code, improve performance metrics (Core Web Vitals), and give the UI a fresh '2026' aesthetic without losing your SEO ranking." },
                        { id: "support", category: "Support", question: "Do you offer post-launch support?", answer: "Absolutely. All our packages come with a 30-day bug-fix warranty. Beyond that, we offer tiered maintenance plans that cover security updates, feature additions, and server monitoring." },
                        { id: "tech", category: "Technical", question: "What technologies do you use?", answer: "We are full-stack experts. Frontend: React, Next.js, Tailwind, Three.js. Backend: Node.js, Python (Django/FastAPI), Go. Database: PostgreSQL, MongoDB, Redis. We choose the best tool for your specific goals." }
                    ],
                    techStack: [
                        { id: "frontend", label: "Frontend", iconName: "Layout", description: "Pixel-perfect interfaces", techs: ["React", "Next.js 14", "Vue.js", "Tailwind CSS", "Framer Motion", "Three.js", "TypeScript", "Redux"] },
                        { id: "backend", label: "Backend", iconName: "Server", description: "Robust scalable logic", techs: ["Node.js", "NestJS", "Express", "Python", "Django", "GoLang", "GraphQL", "WebSockets"] },
                        { id: "database", label: "Database", iconName: "Database", description: "High-performance storage", techs: ["PostgreSQL", "MongoDB", "Redis", "Supabase", "Prisma", "MySQL", "Elasticsearch"] },
                        { id: "cloud", label: "DevOps & Cloud", iconName: "Cloud", description: "CI/CD & Infrastructure", techs: ["AWS", "Vercel", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Cloudflare"] },
                        { id: "ai", label: "AI & ML", iconName: "Brain", description: "Intelligent solutions", techs: ["OpenAI API", "PyTorch", "TensorFlow", "LangChain", "Hugging Face", "Pinecone", "LlamaIndex"] },
                        { id: "mobile", label: "Mobile", iconName: "Smartphone", description: "Native experiences", techs: ["React Native", "Expo", "Flutter", "Swift", "Kotlin", "PWA"] }
                    ],
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'shop',
                status: 'published',
                content: {
                    seo: {
                        title: "Shop | Oftisoft Premium Assets",
                        description: "High-fidelity UI kits, templates, and AI modules for modern architects.",
                        keywords: ["ui kits", "templates", "ai modules", "react", "nextjs"],
                        ogImage: "https://oftisoft.com/og/shop.jpg"
                    },
                    header: {
                        title: "Marketplace",
                        description: "Premium templates, UI kits, and enterprise AI solutions."
                    },
                    categories: [
                        {
                            id: "mobile-apps",
                            name: "Mobile Apps",
                            subcategories: ["iOS App Templates", "Android App Templates", "React Native Templates", "Flutter App Templates", "Cross-Platform Apps", "Mobile UI Kits", "Game Templates"],
                            icon: "Smartphone"
                        },
                        {
                            id: "ai-chatbots",
                            name: "AI & Chatbots",
                            subcategories: ["AI Chatbot Templates", "Voice Assistants", "Machine Learning Models", "NLP Solutions", "AI Automation Tools", "Recommendation Systems", "AI Integration Services"],
                            icon: "Bot"
                        },
                        {
                            id: "web-templates",
                            name: "Web Templates",
                            subcategories: ["HTML5 Templates", "Bootstrap Templates", "Tailwind CSS Templates", "Landing Pages", "Portfolio Templates", "E-commerce Templates", "Admin Dashboard Templates"],
                            icon: "Layout"
                        }
                    ],
                    products: [
                        {
                            id: "1",
                            name: "NeonStore - E-commerce UI Kit",
                            slug: "neonstore-ecommerce-ui-kit",
                            description: "A futuristic, glassmorphic e-commerce UI kit for modern brands.",
                            price: 49,
                            rating: 4.8,
                            reviews: 124,
                            category: "Mobile Apps",
                            subcategory: "Mobile UI Kits",
                            image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=800&auto=format&fit=crop",
                            tags: ["Figma", "React Native", "UI Kit"],
                            features: ["50+ Screens", "Dark Mode Ready", "Vector Icons", "Auto Layout"],
                            screenshots: ["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800", "https://images.unsplash.com/photo-1607082350899-7e102dc3b6a2?q=80&w=800"],
                            demoUrl: "https://neonstore.demo",
                            docUrl: "https://docs.neonstore.tech",
                            compatibility: ["Figma", "React Native 0.73+", "iOS 15+", "Android 12+"],
                            version: "v2.1.0",
                            updatePolicy: "Free updates for 6 months",
                            licenseRegular: 49,
                            licenseExtended: 499,
                            lastUpdated: "2026-01-15",
                            faqs: [
                                { question: "Can I use this for multiple projects?", answer: "The Regular License is for one project. The Extended License allows multiple." },
                                { question: "Is Figma file included?", answer: "Yes, fully layered Figma files are included." }
                            ]
                        },
                        {
                            id: "2",
                            name: "AI ChatBot Pro",
                            slug: "ai-chatbot-pro",
                            description: "Advanced AI chatbot template integrated with OpenAI GPT-4.",
                            price: 199,
                            rating: 4.9,
                            reviews: 85,
                            category: "AI & Chatbots",
                            subcategory: "AI Chatbot Templates",
                            image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=800&auto=format&fit=crop",
                            tags: ["Next.js", "TypeScipt", "OpenAI"],
                            features: ["GPT-4 Integration", "Stream Responses", "Custom Knowledge Base", "Admin Dashboard"],
                            screenshots: ["https://images.unsplash.com/photo-1535378437332-957b45462295?q=80&w=800", "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800"],
                            demoUrl: "https://aichat.demo",
                            docUrl: "https://docs.aichat.tech",
                            compatibility: ["Next.js 14+", "Node.js 18+", "OpenAI API Key"],
                            version: "v1.5.2",
                            updatePolicy: "Lifetime free updates",
                            licenseRegular: 199,
                            licenseExtended: 899,
                            lastUpdated: "2026-02-01",
                            faqs: [
                                { question: "Do I need my own API key?", answer: "Yes, you need an OpenAI API key to use the chatbot features." },
                                { question: "Can it handle PDF files?", answer: "Yes, it supports RAG with PDF and text files." }
                            ]
                        },
                        {
                            id: "3",
                            name: "FinTrack Dashboard",
                            slug: "fintrack-dashboard",
                            description: "Comprehensive admin dashboard for financial applications.",
                            price: 79,
                            rating: 4.7,
                            reviews: 56,
                            category: "Web Templates",
                            subcategory: "Admin Dashboard Templates",
                            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
                            tags: ["React", "Material UI", "Dashboard"],
                            features: ["Dark/Light Mode", "Charts & Graphs", "Data Grid", "Authentication"],
                            screenshots: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800"],
                            demoUrl: "https://fintrack.demo",
                            docUrl: "https://docs.fintrack.tech",
                            compatibility: ["React 18", "MUI v5"],
                            version: "v1.2.0",
                            updatePolicy: "Free updates for 1 year",
                            licenseRegular: 79,
                            licenseExtended: 399,
                            lastUpdated: "2026-01-20",
                            faqs: [
                                { question: "Is it responsive?", answer: "Yes, fully responsive on all devices." },
                                { question: "Does it support TypeScript?", answer: "Yes, full TypeScript source code included." }
                            ]
                        },
                        {
                            id: "4",
                            name: "Quantum Design System",
                            slug: "quantum-design-system",
                            description: "A massive Figma design system for enterprise products.",
                            price: 99,
                            rating: 4.9,
                            reviews: 210,
                            category: "Web Templates",
                            subcategory: "UI Kits",
                            image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop",
                            tags: ["Figma", "Design System", "UI/UX"],
                            features: ["2000+ Components", "Auto Layout", "Variables", "Dark Mode"],
                            screenshots: ["https://images.unsplash.com/photo-1586717791821-3f44a5638d0f?q=80&w=800", "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800"],
                            demoUrl: "https://quantum.demo",
                            docUrl: "https://docs.quantum.design",
                            compatibility: ["Figma"],
                            version: "v3.0.0",
                            updatePolicy: "Lifetime updates",
                            licenseRegular: 99,
                            licenseExtended: 499,
                            lastUpdated: "2026-02-05",
                            faqs: [
                                { question: "Is there a sketch version?", answer: "Currently only Figma is supported." }
                            ]
                        }
                    ],
                    bundles: [
                        {
                            id: "b1",
                            name: "Ultimate SaaS Enterprise Bundle",
                            description: "Everything you need to launch a high-scale SaaS: UI Kit + Backend Boilerplate + AI Bot.",
                            products: ["1", "2", "3", "4"],
                            price: 499,
                            originalPrice: 847,
                            savings: 348,
                            image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=800&auto=format&fit=crop",
                            tags: ["Save $348", "Best Value"],
                            status: "active"
                        }
                    ],
                    testimonials: [
                        {
                            id: "t1",
                            name: "Alex Rivers",
                            role: "Lead Developer @ TechFlow",
                            content: "The NeonStore UI Kit saved us weeks of design time. The code quality is exceptional and highly modular.",
                            rating: 5,
                            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop"
                        },
                        {
                            id: "t2",
                            name: "Maria Garcia",
                            role: "Product Designer @ CreativeX",
                            content: "Quantum Design System is a game changer. The auto-layout and component variants are incredibly well thought out.",
                            rating: 5,
                            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop"
                        },
                        {
                            id: "t3",
                            name: "James Chen",
                            role: "Founder @ StartupIO",
                            content: "AI ChatBot Pro allowed us to launch our support bot in just 2 days. The RAG integration is seamless.",
                            rating: 4,
                            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop"
                        }
                    ],
                    lastUpdated: new Date().toISOString()
                }
            },
            {
                pageKey: 'status',
                status: 'published',
                content: {
                    seo: {
                        title: "System Status | Oftisoft",
                        description: "Real-time system status and incident history for Oftisoft services.",
                        keywords: ["status", "uptime", "health", "incidents"],
                        ogImage: "https://oftisoft.com/og/status.jpg"
                    },
                    header: {
                        badge: "Infrastructure Pulse Node",
                        title: "System Status.",
                        mainStatus: {
                            title: "All Systems Operational",
                            description: "Sync Pulse Normal / Sub-10ms Architecture"
                        },
                        videoUrl: ""
                    },
                    systems: [
                        { id: "edge", name: "Oftisoft Edge Proxy", status: "Operational", uptime: "99.99%", latency: "14ms", iconName: "Globe", color: "text-green-500" },
                        { id: "neural", name: "Neural Engine Core", status: "Operational", uptime: "100%", latency: "128ms", iconName: "Cpu", color: "text-green-500" },
                        { id: "forge", name: "Visual Forge API", status: "Operational", uptime: "99.95%", latency: "42ms", iconName: "Zap", color: "text-green-500" },
                        { id: "cdn", name: "Global CDN Nodes", status: "Operational", uptime: "99.9%", latency: "45ms", iconName: "Server", color: "text-green-500" },
                        { id: "identity", name: "Identity Governance", status: "Operational", uptime: "100%", latency: "8ms", iconName: "ShieldCheck", color: "text-green-500" },
                        { id: "vaults", name: "Digital Asset Vaults", status: "Operational", uptime: "99.99%", latency: "31ms", iconName: "Database", color: "text-green-500" },
                    ],
                    incidents: {
                        title: "Historical Nodes (Incidents)",
                        logs: [
                            { id: "i1", date: "Feb 06, 2026", title: "Edge Proxy Expansion Delay", desc: "Minor latency spikes detected in EU-West nodes during architectural expansion.", status: "Resolved", color: "bg-green-500" },
                            { id: "i2", date: "Jan 28, 2026", title: "Identity Layer Sync Interrupt", desc: "Systematic upgrade of MFA nodes caused partial de-sync for 14 minutes.", status: "Resolved", color: "bg-green-500" },
                        ]
                    },
                    monitoring: {
                        note: "Systems are monitored 24/7/365 by our autonomous neural agents.",
                        nextSyncText: "Next Auto-Sync in 5s"
                    },
                    lastUpdated: new Date().toISOString()
                }
            },
        ];

        for (const page of pages) {
            const existing = await this.pageContentRepo.findOne({ where: { pageKey: page.pageKey } });
            if (existing) {
                // Update existing page content
                existing.content = page.content;
                existing.status = page.status;
                await this.pageContentRepo.save(existing);
            } else {
                // Create new page
                await this.pageContentRepo.save(this.pageContentRepo.create(page));
            }
        }
        this.logger.log('Page Architectures: Synced and Updated in Database');
    }

    private async seedConversations() {
        const adminEmail = 'rasel@oftisoft.com';
        const botEmail = 'sarah@oftisoft.com';

        const admin = await this.userRepo.findOne({ where: { email: adminEmail } });
        const bot = await this.userRepo.findOne({ where: { email: botEmail } });

        if (!admin || !bot) return;

        // Check if there is already a conversation between them
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
                name: 'Sarah - Oftisoft Support'
            });
            const savedConv = await this.conversationRepo.save(conversation);

            // Add a welcome message
            const message = this.messageRepo.create({
                content: 'Welcome to Oftisoft, Chief Architect! I am Sarah, your dedicated support node. How can I assist you in forging your next digital masterpiece today?',
                sender: bot,
                conversation: savedConv,
                read: false
            });
            await this.messageRepo.save(message);

            this.logger.log('Nexus Communication Node: Initialized');
        }
    }
}
