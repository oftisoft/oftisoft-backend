import { Injectable, NotFoundException } from '@nestjs/common';
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
    ) { }

    async getAllFiles(): Promise<{ name: string; url: string; size: number; createdAt: Date }[]> {
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
            })
        );
        // Sort by newest first
        return fileStats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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

    async updatePageContent(pageKey: string, updateDto: UpdatePageContentDto): Promise<PageContent> {
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
                    socials: { github: "https://github.com", linkedin: "https://linkedin.com", twitter: "https://twitter.com" }
                },
                mission: {
                    badge: "Our DNA",
                    titleLine1: "Driven by Purpose,",
                    titleLine2: "Defined by Quality.",
                    quote: "Our mission is to empower visionaries with the technology they need to change the world. We don't just write code; we architect experiences that matter.",
                    quoteHighlight: "architect experiences"
                },
                values: [
                    { title: "Radical Quality", description: "Near-obsessive focus on every pixel and line of code.", icon: "Target" },
                    { title: "Neural Innovation", description: "Leveraging the latest in AI and automation.", icon: "Zap" },
                    { title: "Human Connection", description: "Building lasting partnerships with our clients.", icon: "Handshake" },
                    { title: "Fearless Engineering", description: "Solving complex problems with confidence.", icon: "ShieldCheck" }
                ],
                timeline: [
                    { year: "2018", title: "Genesis Node", desc: "Rasel Hossain initiates the first development protocols as a solo consultant.", icon: "Zap", gradient: "from-blue-600 to-cyan-400" },
                    { year: "2020", title: "Platform Expansion", desc: "Expanding into enterprise WordPress and mobile architectures.", icon: "Globe", gradient: "from-purple-600 to-pink-500" },
                    { year: "2023", title: "Oftisoft Synthesis", desc: "Formalizing Ofitsoft as a unified high-fidelity engineering operative.", icon: "Rocket", gradient: "from-amber-400 to-orange-500" },
                    { year: "2026", title: "Future Forge", desc: "Leading the way in AI-integrated development and neural sync systems.", icon: "Clock", gradient: "from-emerald-500 to-cyan-500" }
                ],
                timelineBadge: "Our Origins",
                timelineTitle: "Evolution of",
                timelineTitleHighlight: "Innovation.",
                culture: {
                    badge: "Life at Ofitsoft",
                    titleLine1: "Where Culture Meets",
                    titleLine2: "Creativity.",
                    items: [
                        { id: "1", title: "Design Session", location: "Oftisoft Lab 01", type: "image", size: "md:col-span-2 md:row-span-2", thumb: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" },
                        { id: "2", title: "Coffee & Code", location: "Common Zone", type: "image", size: "md:col-span-1 md:row-span-1", thumb: "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=400&auto=format&fit=crop" },
                        { id: "3", title: "Future Launch", location: "Main Stage", type: "video", size: "md:col-span-1 md:row-span-2", thumb: "https://images.unsplash.com/photo-1540317580384-e5d418a6293b?q=80&w=400&auto=format&fit=crop" },
                        { id: "4", title: "Tech Talk", location: "Innovation Hub", type: "image", size: "md:col-span-1 md:row-span-1", thumb: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop" }
                    ]
                },
                awardsBadge: "Hall of Fame",
                awardsTitle: "Recognized for",
                awardsTitleHighlight: "Digital Excellence.",
                awardsDescription: "Our relentless pursuit of perfection has earned us accolades from the industry's most prestigious bodies.",
                awards: [
                    { id: "a1", year: "2024", title: "Top Web Architect", org: "Clutch Global", description: "Recognized as a leading provider of high-fidelity web architectures.", gradient: "from-blue-600 to-cyan-400" },
                    { id: "a2", year: "2023", title: "Innovation Award", org: "Tech Matrix", description: "Awarded for excellence in AI-integrated mobile solutions.", gradient: "from-purple-600 to-pink-500" },
                    { id: "a3", year: "2022", title: "Design Excellence", org: "Awwwards Node", description: "Honored for premium aesthetics and engaging user experiences.", gradient: "from-rose-500 to-amber-500" }
                ],
                team: {
                    badge: "The Collective",
                    titleLine1: "Architects of the",
                    titleLine2: "Impossible.",
                    members: [
                        { id: "m1", name: "Rasel Hossain", role: "Chief Architect", category: "Leadership", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop", gradient: "from-blue-600 to-cyan-400", socials: { github: "#", linkedin: "#", twitter: "#" } },
                        { id: "m2", name: "Sarah Jenkins", role: "UI Strategist", category: "Design", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop", gradient: "from-purple-600 to-pink-500", socials: { github: "#", linkedin: "#", twitter: "#" } },
                        { id: "m3", name: "Mike Thompson", role: "Logic Engineer", category: "Development", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop", gradient: "from-cyan-400 to-emerald-500", socials: { github: "#", linkedin: "#", twitter: "#" } }
                    ]
                },
                cta: {
                    badge: "Join the Protocol",
                    title: "Ready to Forge Your",
                    highlight: "Digital Legacy?",
                    description: "Connect with our architectural operative today and initiate your next high-fidelity sync.",
                    buttonText: "Initiate Sync Now"
                }
            },
            services: {
                overview: [
                    {
                        id: "web",
                        label: "Full-Stack & Web",
                        title: "High-Fidelity Web Architectures.",
                        iconName: "Globe",
                        gradient: "from-blue-600/20 to-cyan-500/20",
                        description: "Modern, attractive, and engaging web platforms designed to create a strong connection with users. Specialized in WordPress and Full-Stack development.",
                        features: [
                            { title: "WordPress Mastery", desc: "Custom themes and headless CMS solutions.", iconName: "Layout" },
                            { title: "React/Next.js", desc: "Performance-optimized modern frontends.", iconName: "Zap" },
                            { title: "Engaging UI", desc: "Premium designs that WOW your users.", iconName: "Sparkles" }
                        ]
                    },
                    {
                        id: "mobile",
                        label: "Mobile Apps",
                        title: "Cross-Platform Neural Sync.",
                        iconName: "Smartphone",
                        gradient: "from-purple-600/20 to-pink-500/20",
                        description: "Native-quality mobile applications for iOS and Android using MAUI, React Native, and Flutter.",
                        features: [
                            { title: "MAUI Development", desc: "Enterprise-grade cross-platform apps.", iconName: "Layers" },
                            { title: "High Fidelity UI", desc: "Smooth animations and responsive designs.", iconName: "Smartphone" },
                            { title: "Unified Logic", desc: "One codebase for all mobile nodes.", iconName: "Grid" }
                        ]
                    },
                    {
                        id: "ai",
                        label: "AI & Automation",
                        title: "Intelligent Autonomic Agents.",
                        iconName: "Brain",
                        gradient: "from-green-600/20 to-emerald-500/20",
                        description: "AI chatbots and automation workflows that streamline your business and engage your customers.",
                        features: [
                            { title: "AI Chatbots", desc: "Natural language support agents.", iconName: "MessageSquare" },
                            { title: "AI Automation", desc: "Automate repetitive business nodes.", iconName: "Zap" },
                            { title: "Neural Sync", desc: "Deep integration with your data.", iconName: "Database" }
                        ]
                    }
                ]
            },
            terms: {
                header: {
                    badge: "Operational Governance",
                    title: "Terms of Sync.",
                    description: "Legal framework and architectural governance protocols for the Oftisoft ecosystem.",
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
                        content: "By initiating a sync with Oftisoft, you are granted a revocable, non-exclusive license to utilize our high-fidelity digital artifacts and development nodes."
                    },
                    {
                        id: "sovereignty",
                        title: "Neural Logic Sovereignty",
                        iconName: "Scale",
                        content: "All neural artifacts forged via our private engine remain the intellectual property of the architect (USER)."
                    }
                ],
                revision: {
                    prefix: "Last Governance Update:",
                    updatedAt: new Date().toLocaleDateString()
                },
                lastUpdated: new Date().toISOString()
            },
            support: {
                header: {
                    badge: "Architectural Assistance Hub",
                    title: "Support Universe.",
                    searchPlaceholder: "Find architectural support nodes...",
                    videoUrl: ""
                },
                channels: [
                    { id: "bot", title: "Neural Chat Bot", desc: "Immediate AI assistance for architectural queries and node status.", iconName: "Bot", color: "text-primary" },
                    { id: "chat", title: "Direct Sync (Chat)", desc: "Join the real-time architect's channel for deep implementation syncs.", iconName: "MessageSquare", color: "text-blue-500" },
                    { id: "docs", title: "Global SDK Docs", desc: "Exhaustive technical intelligence for independent platform mastery.", iconName: "Terminal", color: "text-purple-500" },
                ],
                faq: {
                    badge: "Protocol Intelligence",
                    title: "Frequent Sync Questions",
                    items: [
                        { id: "sync", q: "How do I initiate a neural sync?", a: "Navigate to the Visual Forge in your dashboard and commit your first node artifact." },
                        { id: "latency", q: "What is the global edge latency?", a: "Oftisoft utilizes a proprietary proxy matrix ensuring sub-10ms delivery for document nodes." },
                    ]
                },
                priorityRelay: {
                    title: "Priority Relay",
                    description: "Elite and Enterprise architects can initiate a high-fidelity direct sync with our core engineering operative.",
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
            },
            privacy: {
                header: {
                    title: "Privacy Policy",
                    description: "How we protect and handle your data."
                },
                sections: []
            },
            settings: {
                heroTitle: "Oftisoft - Hyper-Scale Growth",
                pathNode: "home",
                glassmorphism: true,
                motion: true,
                vfx: true
            },
            global: {
                navbar: {
                    brandName: "Oftisoft",
                    links: [
                        { label: "Home", href: "/" },
                        { label: "Services", href: "/services" },
                        { label: "About", href: "/about" },
                        { label: "Support", href: "/support" }
                    ]
                },
                footer: {
                    tagline: "Architecting the next generation of digital artifacts with high-fidelity engineering.",
                    columns: [
                        {
                            title: "Ecosystem",
                            links: [
                                { label: "Nodes", href: "/services" },
                                { label: "Forge", href: "/forge" },
                                { label: "Nexus", href: "/nexus" }
                            ]
                        },
                        {
                            title: "Governance",
                            links: [
                                { label: "Terms", href: "/terms" },
                                { label: "Privacy", href: "/privacy" }
                            ]
                        }
                    ]
                }
            }
        };

        return defaults[pageKey] || { sections: [] };
    }
}
