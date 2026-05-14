import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PostsService } from './posts/posts.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostType, PostStatus } from './entities/post.entity';

const postsData = [
  {
    title: 'The Rise of Agentic AI: Transforming Enterprise Workflows',
    slug: 'rise-of-agentic-ai',
    excerpt: 'How autonomous AI agents are reshaping enterprise operations, from customer service to supply chain management, and what it means for your business.',
    content: `Introduction\n\nThe landscape of artificial intelligence is undergoing a paradigm shift. While traditional AI systems have excelled at pattern recognition and prediction, a new breed of AI—agentic AI—is emerging that can autonomously plan, execute, and iterate on complex tasks.\n\nWhat is Agentic AI?\n\nAgentic AI refers to AI systems that can independently pursue goals, make decisions, and take actions within defined parameters. Unlike conventional AI that responds to specific prompts, agentic AI systems maintain context, break down complex objectives into subtasks, and execute multi-step workflows.\n\nKey Capabilities\n\n1. Autonomous Decision-Making: Agentic AI systems evaluate options and make decisions without human intervention at every step.\n\n2. Multi-Step Planning: These systems can decompose complex goals into manageable subtasks and execute them in sequence.\n\n3. Self-Correction: When encountering obstacles, agentic AI can adjust its approach and try alternative strategies.\n\n4. Tool Integration: Modern agentic frameworks can interact with APIs, databases, and other software tools to accomplish goals.\n\nReal-World Applications\n\nCustomer Service: AI agents now handle end-to-end customer support, from initial inquiry to resolution, integrating with CRM systems and knowledge bases.\n\nSoftware Development: Agentic coding assistants can plan, write, test, and debug code across entire codebases.\n\nSupply Chain: Autonomous agents monitor inventory, predict demand, and place orders automatically.\n\nThe Road Ahead\n\nAs agentic AI matures, we can expect to see more sophisticated multi-agent systems where specialized AI agents collaborate on complex tasks, much like human teams do today. The key challenge remains ensuring safety, alignment, and proper oversight.`,
    type: PostType.ARTICLE,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
    featuredImageAlt: 'AI neural network visualization representing agentic intelligence',
    seoTitle: 'Agentic AI: Transforming Enterprise Workflows in 2026 | Oftisoft',
    seoDescription: 'Discover how autonomous AI agents are revolutionizing enterprise operations, from customer service to supply chain management. Learn what agentic AI means for your business.',
    canonicalUrl: 'https://oftisoft.com/blog/rise-of-agentic-ai',
    isIndexed: true,
    isFeatured: true,
    isPinned: false,
    allowComments: true,
    keywords: ['agentic AI', 'enterprise AI', 'autonomous agents', 'AI workflows', 'machine learning'],
    categorySlug: 'ai',
    tags: ['AI', 'Enterprise', 'Automation', 'Machine Learning'],
  },
  {
    title: 'Building Scalable Microservices with NestJS and TypeORM',
    slug: 'scalable-microservices-nestjs-typeorm',
    excerpt: 'A comprehensive guide to building production-ready microservices using NestJS, TypeORM, and PostgreSQL with best practices for scaling.',
    content: `Introduction\n\nMicroservices architecture has become the gold standard for building scalable, maintainable backend systems. NestJS, with its modular architecture and强大的 dependency injection system, provides an excellent foundation for microservice development.\n\nWhy NestJS for Microservices?\n\nNestJS offers first-class support for microservice patterns including TCP, Redis, RabbitMQ, and Kafka transports. Its decorator-based architecture makes it easy to create well-structured, testable services.\n\nSetting Up the Foundation\n\nStart with a NestJS application using the CLI: $ nest new backend\n\nChoose the microservice template and configure your transport layer. For most applications, Redis or RabbitMQ provides the right balance of performance and feature richness.\n\nDatabase Architecture\n\nTypeORM with PostgreSQL offers a robust foundation. Use migrations for schema management, and consider implementing the Repository pattern for clean data access layers.\n\nBest Practices\n\n1. Service Discovery: Implement dynamic service discovery using Redis or Consul.\n\n2. API Gateway: Use NestJS Gateway module for request routing and load balancing.\n\n3. Circuit Breakers: Protect your services from cascading failures.\n\n4. Distributed Tracing: Implement OpenTelemetry for end-to-end request tracking.\n\n5. Health Checks: Regular health monitoring ensures system reliability.`,
    type: PostType.TUTORIAL,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    featuredImageAlt: 'Server rack with blinking lights representing scalable infrastructure',
    seoTitle: 'Building Scalable Microservices with NestJS and TypeORM | Oftisoft',
    seoDescription: 'A comprehensive guide to building production-ready microservices with NestJS, TypeORM, and PostgreSQL. Learn best practices for scaling your backend architecture.',
    canonicalUrl: 'https://oftisoft.com/blog/scalable-microservices-nestjs-typeorm',
    isIndexed: true,
    isFeatured: false,
    isPinned: false,
    allowComments: true,
    keywords: ['NestJS', 'TypeORM', 'microservices', 'PostgreSQL', 'backend architecture'],
    categorySlug: 'web',
    tags: ['NestJS', 'TypeORM', 'Microservices', 'PostgreSQL', 'Backend'],
  },
  {
    title: 'Flutter vs React Native: A Developer\'s Perspective for 2026',
    slug: 'flutter-vs-react-native-2026',
    excerpt: 'An honest comparison of Flutter and React Native for cross-platform mobile development, covering performance, developer experience, and production readiness.',
    content: `Introduction\n\nThe cross-platform mobile development landscape continues to evolve rapidly. Flutter and React Native remain the dominant frameworks, but each has evolved significantly in 2026.\n\nFlutter: The Rising Powerhouse\n\nFlutter's widget-based architecture and Dart language offer unmatched performance and UI consistency. The latest updates include improved web support, better desktop integration, and enhanced hot reload capabilities.\n\nReact Native: The Mature Contender\n\nWith the new architecture (Fabric renderer + TurboModules), React Native now offers near-native performance. The vast ecosystem and JavaScript/TypeScript developer pool remain significant advantages.\n\nPerformance Comparison\n\nFlutter excels in UI rendering performance, consistently achieving 60fps animations. React Native's new architecture has closed the gap significantly, with most applications seeing comparable performance.\n\nDeveloper Experience\n\nReact Native's hot reload and vast library ecosystem give it an edge in rapid prototyping. Flutter's hot reload is faster, but Dart has a steeper learning curve for JavaScript developers.\n\nProduction Considerations\n\nBoth frameworks are production-ready. React Native's larger community means more third-party libraries and solutions. Flutter's single-codebase approach (mobile + web + desktop) makes it attractive for teams targeting multiple platforms.\n\nVerdict\n\nChoose Flutter for performance-critical applications and multi-platform deployment. Choose React Native for rapid development with a large ecosystem.`,
    type: PostType.ARTICLE,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80',
    featuredImageAlt: 'Mobile phones displaying app interfaces',
    seoTitle: 'Flutter vs React Native: Developer\'s Guide 2026 | Oftisoft',
    seoDescription: 'An honest comparison of Flutter and React Native for cross-platform mobile development in 2026. Performance, dev experience, and production readiness analyzed.',
    canonicalUrl: 'https://oftisoft.com/blog/flutter-vs-react-native-2026',
    isIndexed: true,
    isFeatured: false,
    isPinned: false,
    allowComments: true,
    keywords: ['Flutter', 'React Native', 'cross-platform', 'mobile development', 'framework comparison'],
    categorySlug: 'mobile',
    tags: ['Flutter', 'React Native', 'Mobile', 'Cross-Platform'],
  },
  {
    title: 'Zero-Trust Architecture: Implementing Security in Modern Cloud Infrastructure',
    slug: 'zero-trust-architecture-cloud-security',
    excerpt: 'Learn how to implement zero-trust security principles in your cloud infrastructure, from identity management to network segmentation and continuous verification.',
    content: `Introduction\n\nThe traditional perimeter-based security model is no longer sufficient in today's distributed, cloud-native world. Zero-trust architecture (ZTA) operates on the principle of "never trust, always verify."\n\nCore Principles\n\n1. Verify Explicitly: Authenticate and authorize based on all available data points—identity, location, device health, and behavior patterns.\n\n2. Least Privilege Access: Grant only the minimum permissions necessary for each user or service to function.\n\n3. Assume Breach: Design systems assuming an attacker is already present. Segment networks, encrypt all traffic, and monitor continuously.\n\nImplementation Strategy\n\nIdentity as the New Perimeter\n\nImplement strong identity management with multi-factor authentication, single sign-on, and just-in-time access provisioning.\n\nMicrosegmentation\n\nDivide your network into isolated segments with granular firewall rules. Each segment can only communicate with authorized services.\n\nContinuous Monitoring\n\nDeploy SIEM and SOAR tools with machine learning-based anomaly detection. Monitor user behavior patterns and flag deviations.\n\nTools and Technologies\n\n- Identity: Okta, Azure AD, Keycloak\n- Network: Cloudflare Zero Trust, Zscaler, Palo Alto Prisma\n- Endpoint: CrowdStrike, SentinelOne\n- Data: HashiCorp Vault, AWS KMS`,
    type: PostType.TUTORIAL,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80',
    featuredImageAlt: 'Digital security lock on a circuit board background',
    seoTitle: 'Zero-Trust Architecture: Cloud Security Implementation Guide | Oftisoft',
    seoDescription: 'Learn to implement zero-trust security in your cloud infrastructure. Covers identity management, microsegmentation, continuous monitoring, and best practices.',
    canonicalUrl: 'https://oftisoft.com/blog/zero-trust-architecture-cloud-security',
    isIndexed: true,
    isFeatured: false,
    isPinned: true,
    allowComments: true,
    keywords: ['zero trust', 'cloud security', 'cybersecurity', 'infrastructure security', 'ZTA'],
    categorySlug: 'devops',
    tags: ['Security', 'Cloud', 'DevOps', 'Infrastructure'],
  },
  {
    title: 'How We Built a Real-Time Collaborative Code Editor with WebSockets',
    slug: 'real-time-collaborative-code-editor',
    excerpt: 'A deep dive into building a real-time collaborative code editor using WebSockets, Operational Transform, and CRDTs, inspired by Google Docs for code.',
    content: `Introduction\n\nCollaborative editing is one of the hardest problems in distributed systems engineering. We set out to build a real-time collaborative code editor that supports multiple developers working on the same file simultaneously.\n\nArchitecture Overview\n\nOur system uses a hybrid approach combining Operational Transform (OT) for text operations and Conflict-free Replicated Data Types (CRDTs) for conflict resolution.\n\nWebSocket Infrastructure\n\nWe built the real-time layer using Socket.io with Redis adapter for horizontal scaling. Each editing session is a room, and all operations are broadcast with causal ordering.\n\nConflict Resolution Strategy\n\nFor text operations, we implemented the Jupiter OT algorithm, which maintains consistent state across clients. For structural elements like file trees, we use CRDTs based on the LSEQ algorithm.\n\nPerformance Optimizations\n\n1. Operation Batching: Group operations before sending to reduce network overhead.\n\n2. Throttling: Apply throttling to cursor position updates.\n\n3. Local Prediction: Show edits immediately before server confirmation.\n\nLessons Learned\n\nBuilding real-time collaborative features is challenging but rewarding. The key is choosing the right consistency model for your use case and designing for network failures from day one.`,
    type: PostType.CASE_STUDY,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80',
    featuredImageAlt: 'Code on a monitor screen with collaborative editing interface',
    seoTitle: 'Building a Real-Time Collaborative Code Editor | Oftisoft Case Study',
    seoDescription: 'A deep dive into building a real-time collaborative code editor using WebSockets, OT algorithms, and CRDTs. Lessons learned from production implementation.',
    canonicalUrl: 'https://oftisoft.com/blog/real-time-collaborative-code-editor',
    isIndexed: true,
    isFeatured: true,
    isPinned: false,
    allowComments: true,
    keywords: ['collaborative editing', 'WebSockets', 'CRDT', 'OT algorithm', 'real-time'],
    categorySlug: 'web',
    tags: ['WebSockets', 'CRDT', 'Collaboration', 'Real-Time', 'Socket.io'],
  },
  {
    title: 'The Complete Guide to RAG Systems: Building AI-Powered Search',
    slug: 'complete-guide-rag-systems',
    excerpt: 'Everything you need to know about Retrieval-Augmented Generation systems, from vector embeddings to hybrid search and LLM orchestration.',
    content: `Introduction\n\nRetrieval-Augmented Generation (RAG) has emerged as the leading architecture for building AI-powered search and question-answering systems. By combining the retrieval capabilities of vector databases with the generative power of LLMs, RAG systems deliver accurate, contextual responses.\n\nHow RAG Works\n\n1. Ingestion: Documents are chunked, embedded, and stored in a vector database.\n\n2. Retrieval: User queries are embedded and the vector database returns the most similar document chunks.\n\n3. Generation: Retrieved context is injected into the LLM prompt along with the user's question.\n\n4. Response: The LLM generates a response grounded in the retrieved context.\n\nVector Database Options\n\n- Pinecone: Fully managed, highly scalable, ideal for production\n- Weaviate: Open-source with hybrid search capabilities\n- Qdrant: Rust-based, extremely performant\n- pgvector: PostgreSQL extension, great for existing Postgres users\n\nAdvanced Techniques\n\nHybrid Search: Combine vector similarity with keyword search (BM25) for optimal results.\n\nQuery Transformation: Rewrite user queries for better retrieval, including HyDE (Hypothetical Document Embeddings).\n\nReranking: Use cross-encoder models to rerank retrieved chunks for precision.\n\nEvaluating RAG Systems\n\nUse metrics like Hit Rate, MRR, NDCG for retrieval quality. For generation quality, use LLM-as-judge evaluation with frameworks like RAGAS.`,
    type: PostType.TUTORIAL,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
    featuredImageAlt: 'AI neural network nodes with data flow visualization',
    seoTitle: 'Complete Guide to RAG Systems: Build AI-Powered Search | Oftisoft',
    seoDescription: 'Everything about Retrieval-Augmented Generation systems—vector embeddings, hybrid search, LLM orchestration, vector databases, and evaluation techniques.',
    canonicalUrl: 'https://oftisoft.com/blog/complete-guide-rag-systems',
    isIndexed: true,
    isFeatured: false,
    isPinned: false,
    allowComments: true,
    keywords: ['RAG', 'retrieval augmented generation', 'vector database', 'AI search', 'LLM'],
    categorySlug: 'ai',
    tags: ['AI', 'RAG', 'Vector Database', 'LLM', 'Search'],
  },
  {
    title: 'Kubernetes in Production: Lessons from Running 500+ Microservices',
    slug: 'kubernetes-production-lessons',
    excerpt: 'Hard-earned lessons from running a production Kubernetes cluster with 500+ microservices, covering networking, monitoring, cost optimization, and incident response.',
    content: `Introduction\n\nAfter three years running a production Kubernetes cluster serving millions of users, our team has accumulated hard-won knowledge about what works and what doesn't at scale.\n\nCluster Design\n\nWe run a multi-cluster setup with dedicated clusters for different environments and criticality levels. Each cluster has\n\n- Control plane: Managed EKS with custom add-ons\n- Node pools: Separated by workload type (CPU, memory, GPU)\n- Network: Cilium for CNI with eBPF for observability\n\nCritical Lessons\n\n1. Resource Limits Are Not Optional: Every pod must have CPU and memory limits. Unbounded pods will eventually cause node pressure and cascading failures.\n\n2. Horizontal Pod Autoscaling Needs Proper Metrics: CPU-based autoscaling is insufficient. Use custom metrics based on request latency and queue depth.\n\n3. Network Policies Are Your Friend: Default-deny network policies prevent blast radius when a service is compromised.\n\nMonitoring Stack\n\n- Metrics: Prometheus + Thanos for long-term storage\n- Logging: Grafana Loki with structured logging\n- Tracing: OpenTelemetry + Jaeger\n- Alerts: Alertmanager with PagerDuty integration\n\nCost Optimization\n\nRight-sizing, spot instances, and cluster autoscaling reduced our infrastructure costs by 40%. We use Karpenter for efficient node provisioning.`,
    type: PostType.CASE_STUDY,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&q=80',
    featuredImageAlt: 'Kubernetes dashboard showing container orchestration',
    seoTitle: 'Kubernetes Production Lessons: 500+ Microservices | Oftisoft',
    seoDescription: 'Hard-earned lessons from running production Kubernetes with 500+ microservices. Covers networking, monitoring, cost optimization, and incident response strategies.',
    canonicalUrl: 'https://oftisoft.com/blog/kubernetes-production-lessons',
    isIndexed: true,
    isFeatured: false,
    isPinned: true,
    allowComments: true,
    keywords: ['Kubernetes', 'production', 'microservices', 'container orchestration', 'DevOps'],
    categorySlug: 'devops',
    tags: ['Kubernetes', 'DevOps', 'Production', 'Scaling', 'Monitoring'],
  },
  {
    title: 'Next.js 16: What\'s New and How to Migrate',
    slug: 'nextjs-16-whats-new',
    excerpt: 'Explore the exciting new features in Next.js 16 including the Turbopack stable release, improved server actions, and enhanced partial prerendering.',
    content: `Introduction\n\nNext.js 16 marks a significant milestone for the React framework, introducing Turbopack as the default bundler in production, enhanced server actions, and a refined developer experience.\n\nTurbopack Goes Stable\n\nAfter two years of development, Turbopack is now the default bundler for both development and production builds. Written in Rust, it offers 10x faster updates and 5x faster cold starts compared to webpack.\n\nImproved Server Actions\n\nServer Actions now support optimistic updates natively, revalidation of specific cache tags, and streaming responses. The API surface has been simplified with better TypeScript inference.\n\nPartial Prerendering (PPR)\n\nPPR is now production-ready, allowing you to combine static and dynamic content on the same page. This eliminates the static/dynamic binary choice.\n\nOther Notable Features\n\n- Enhanced Image Component: AVIF support, better lazy loading\n- Improved Middleware: Edge runtime performance improvements\n- New Bundler API: Plugin system for Turbopack\n- React 19 Support: Full compatibility with React 19 features\n\nMigration Guide\n\n1. Update Next.js version to ^16.0.0\n2. Replace custom webpack configs with Turbopack equivalents\n3. Update Server Actions to use new API patterns\n4. Enable PPR incrementally on routes that benefit from it`,
    type: PostType.NEWS,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80',
    featuredImageAlt: 'Next.js logo on a modern web development interface',
    seoTitle: 'Next.js 16: New Features and Migration Guide | Oftisoft',
    seoDescription: 'Explore Next.js 16 features—Turbopack stable, improved Server Actions, Partial Prerendering, and more. Includes a complete migration guide from Next.js 15.',
    canonicalUrl: 'https://oftisoft.com/blog/nextjs-16-whats-new',
    isIndexed: true,
    isFeatured: false,
    isPinned: false,
    allowComments: true,
    keywords: ['Next.js 16', 'Turbopack', 'React', 'Server Actions', 'migration'],
    categorySlug: 'web',
    tags: ['Next.js', 'React', 'Frontend', 'Web Development', 'Turbopack'],
  },
  {
    title: 'AI-Powered Customer Support: From Chatbots to Autonomous Agents',
    slug: 'ai-powered-customer-support-autonomous-agents',
    excerpt: 'How we transformed our customer support system using AI agents that handle 80% of inquiries autonomously, reducing response time by 90%.',
    content: `Introduction\n\nCustomer support is often the first place companies apply AI, but most implementations stop at simple chatbots. We took it further by building autonomous AI agents that handle complex, multi-step support scenarios.\n\nThe Evolution\n\nPhase 1: Basic FAQ Chatbot\nWe started with a simple intent-classification bot using traditional NLP. It handled 20% of inquiries with rigid, scripted responses.\n\nPhase 2: RAG-Enhanced Support\nBy implementing RAG with our knowledge base, the bot could answer specific product questions by retrieving relevant documentation. This raised the automation rate to 45%.\n\nPhase 3: Autonomous Agents\nThe breakthrough came when we built autonomous agents capable of:\n- Accessing customer accounts (with permission)\n- Executing refunds and plan changes\n- Escalating to humans only when uncertain\n- Learning from resolved tickets\n\nArchitecture\n\nThe system uses a multi-agent architecture where specialized agents handle different domains: billing, technical support, account management. A router agent classifies and directs inquiries.\n\nResults\n\n- 80% of inquiries handled without human intervention\n- Average response time reduced from 4 hours to 2 minutes\n- Customer satisfaction scores improved by 15%\n- Support team now focuses on complex issues`,
    type: PostType.CASE_STUDY,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1531746790095-e5cb157b2059?w=1200&q=80',
    featuredImageAlt: 'Customer support AI interface with chatbot conversation',
    seoTitle: 'AI Customer Support: From Chatbots to Autonomous Agents | Oftisoft',
    seoDescription: 'How we transformed customer support with AI agents handling 80% of inquiries autonomously. 90% faster response time, 15% higher CSAT scores.',
    canonicalUrl: 'https://oftisoft.com/blog/ai-powered-customer-support-autonomous-agents',
    isIndexed: true,
    isFeatured: true,
    isPinned: false,
    allowComments: true,
    keywords: ['AI customer support', 'chatbot', 'autonomous agents', 'RAG', 'customer service'],
    categorySlug: 'ai',
    tags: ['AI', 'Customer Support', 'Automation', 'RAG', 'Chatbot'],
  },
  {
    title: 'Cross-Platform Mobile Development with .NET MAUI in 2026',
    slug: 'dotnet-maui-cross-platform-2026',
    excerpt: 'A practical guide to building cross-platform mobile and desktop applications using .NET MAUI, covering architecture, performance, and deployment strategies.',
    content: `Introduction\n\n.NET MAUI has matured significantly since its initial release, becoming a compelling choice for enterprise cross-platform development, especially for teams already invested in the Microsoft ecosystem.\n\nWhy MAUI in 2026?\n\nThe latest .NET 10 release brings substantial improvements to MAUI: native AOT compilation, improved startup time, and better macOS support. For C# developers, MAUI offers native performance without leaving the .NET ecosystem.\n\nArchitecture Best Practices\n\nUse MVVM with the CommunityToolkit.Mvvm for clean separation of concerns. Implement dependency injection with the built-in Microsoft.Extensions.DependencyInjection.\n\nPerformance Optimizations\n\n- Use Compiled Bindings for faster data binding\n- Implement lazy loading for complex views\n- Leverage native AOT compilation\n- Use Shell navigation for efficient page management\n\nCross-Platform Capabilities\n\nMAUI now supports:\n- Windows (WinUI 3)\n- macOS (native)\n- iOS and iPadOS\n- Android\n- Tizen (limited)\n\nIntegration with Existing Systems\n\nMAUI integrates seamlessly with Azure services, Entity Framework Core for local storage, and SignalR for real-time features.\n\nGetting Started\n\nInstall the MAUI workload and create your first project using the dotnet new maui template. The learning curve is gentle for experienced .NET developers.`,
    type: PostType.TUTORIAL,
    status: PostStatus.PUBLISHED,
    featuredImage: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=1200&q=80',
    featuredImageAlt: 'Multiple devices displaying cross-platform application',
    seoTitle: '.NET MAUI Cross-Platform Development Guide 2026 | Oftisoft',
    seoDescription: 'A practical guide to building cross-platform apps with .NET MAUI in 2026. Covers architecture, MVVM, performance optimization, and deployment strategies.',
    canonicalUrl: 'https://oftisoft.com/blog/dotnet-maui-cross-platform-2026',
    isIndexed: true,
    isFeatured: false,
    isPinned: false,
    allowComments: true,
    keywords: ['.NET MAUI', 'cross-platform', 'C#', 'mobile development', 'desktop development'],
    categorySlug: 'mobile',
    tags: ['MAUI', '.NET', 'Cross-Platform', 'Mobile', 'C#'],
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const postsService = app.get(PostsService);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const categoryRepository = app.get<Repository<Category>>(getRepositoryToken(Category));

    const users = await userRepository.find({ take: 1 });
    if (!users.length) {
      console.error('No users found. Run npm run seed first to create users.');
      process.exit(1);
    }
    const author = users[0];
    console.log(`Using author: ${author.name} (${author.email})`);

    const categories = await categoryRepository.find();
    const categoryMap = new Map(categories.map(c => [c.slug, c]));
    console.log(`Found ${categories.length} categories: ${categories.map(c => c.slug).join(', ')}`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const postData of postsData) {
      const { categorySlug, tags, ...data } = postData;

      const category = categoryMap.get(categorySlug);
      if (!category) {
        console.warn(`Category "${categorySlug}" not found, skipping post "${data.title}"`);
        skippedCount++;
        continue;
      }

      try {
        await postsService.create(
          {
            ...data,
            authorId: author.id,
            categoryId: category.id,
            publishedAt: new Date(),
          },
          tags,
        );
        console.log(`Created: ${data.title}`);
        createdCount++;
      } catch (err: any) {
        if (err.code === '23505' || (err.message && err.message.includes('duplicate'))) {
          console.log(`Skipped (already exists): ${data.title}`);
          skippedCount++;
        } else {
          console.error(`Failed: ${data.title}`, err.message);
          skippedCount++;
        }
      }
    }

    console.log(`\nDone. Created: ${createdCount}, Skipped: ${skippedCount}`);
  } catch (error) {
    console.error('Seeding failed.', error);
  } finally {
    await app.close();
  }
}

bootstrap();
