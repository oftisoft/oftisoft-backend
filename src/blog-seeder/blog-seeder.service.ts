import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BlogSeederService {
  private readonly logger = new Logger(BlogSeederService.name);

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

    return [
      { id: 'post-web-1', title: 'Building Scalable Web Applications with Next.js 15 and React 19', slug: 'building-scalable-web-apps-nextjs15-react19', excerpt: 'Explore the new patterns, server components, streaming, and authentication strategies that make Next.js 15 and React 19 the go-to stack for production web applications in 2025.', content: 'Detailed guide on building scalable web apps...', category: 'web', coverImage: images.web, date: 'Mar 12, 2025', readTime: '8 min read', author: 'Rasel Hossain', featured: true, views: 2840 },
      { id: 'post-web-2', title: 'Microservices vs Monolith: When to Decompose Your Backend', slug: 'microservices-vs-monolith-backend-architecture', excerpt: 'Not every project needs Kubernetes from day one. Here is a practical decision framework for choosing between monolithic and microservices architectures based on team size, traffic, and domain complexity.', content: 'Detailed comparison...', category: 'web', coverImage: images.web, date: 'Feb 28, 2025', readTime: '12 min read', author: 'Rasel Hossain', featured: false, views: 1560 },
      { id: 'post-mobile-1', title: 'React Native at Scale: Architecture Lessons from 10 Production Apps', slug: 'react-native-production-architecture-lessons', excerpt: 'From navigation to state management, push notifications to offline sync — here are the architecture decisions that scaled across 10 different production React Native applications.', content: 'Mobile architecture lessons...', category: 'mobile', coverImage: images.mobile, date: 'Mar 5, 2025', readTime: '10 min read', author: 'Rasel Hossain', featured: false, views: 1250 },
      { id: 'post-ai-1', title: 'Building Custom AI Assistants with OpenAI, LangChain, and FastAPI', slug: 'building-custom-ai-assistants-langchain-openai', excerpt: 'A complete walkthrough for building production-ready AI assistants with streaming responses, memory, tool calling, and observability using the modern Python AI stack.', content: 'AI assistant guide...', category: 'ai', coverImage: images.ai, date: 'Feb 15, 2025', readTime: '15 min read', author: 'Rasel Hossain', featured: false, views: 3200 },
      { id: 'post-ai-2', title: 'Vector Databases 101: Choosing Between Pinecone, Weaviate, Qdrant, and pgvector', slug: 'vector-databases-comparison-pinecone-weaviate-qdrant-pgvector', excerpt: 'A structured, no-fluff comparison of the four most popular vector databases including cost analysis at different scales and integration complexity with real stacks.', content: 'Vector DB comparison...', category: 'ai', coverImage: images.ai, date: 'Feb 1, 2025', readTime: '14 min read', author: 'Rasel Hossain', featured: false, views: 2750 },
      { id: 'post-devops-1', title: 'Docker Compose for Full-Stack Apps: A Production-Ready Setup', slug: 'docker-compose-production-fullstack-setup', excerpt: 'Move beyond the basic docker-compose.yml. Here is a production-ready setup with Nginx, SSL, multi-stage builds, health checks, and zero-downtime deployments for full-stack applications.', content: 'Docker compose guide...', category: 'devops', coverImage: images.devops, date: 'Jan 20, 2025', readTime: '11 min read', author: 'Rasel Hossain', featured: false, views: 1890 },
      { id: 'post-devops-2', title: 'Automating CI/CD with GitHub Actions for MERN, Django, and Flutter Projects', slug: 'cicd-github-actions-mern-django-flutter', excerpt: 'Reusable workflow templates for testing, linting, building, and deploying full-stack apps. Covers Docker, Vercel, AWS, and Firebase deployment targets.', content: 'CI/CD automation...', category: 'devops', coverImage: images.devops, date: 'Feb 10, 2025', readTime: '9 min read', author: 'Rasel Hossain', featured: false, views: 1420 },
    ];
  }

  async seedBlogPosts() {
    this.logger.log('Blog seeding from non-CMS source - posts are managed through the Posts API.');
  }

  async resetBlogPosts() {
    await this.seedBlogPosts();
  }
}
