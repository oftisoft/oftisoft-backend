import './crypto-polyfill';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as csurf from 'csurf';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';
  const cookieSecret = configService.get('COOKIE_SECRET');

  // Security middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser(cookieSecret));

  // CSRF protection (skip for API routes that use token auth)
  if (isProduction && cookieSecret) {
    app.use(
      csurf({
        cookie: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          key: '_csrf',
        },
        value: (req: any) => req.headers['x-csrf-token'] || req.headers['xsrf-token'],
      }),
    );
  }

  // CORS configuration
  const corsOrigins = configService.get('CORS_ORIGINS');
  const frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:3000';

  const allowedOrigins = corsOrigins
    ? corsOrigins.split(',').map((url: string) => url.trim())
    : [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'https://www.oftisoft.com',
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-Client-Version',
      'X-CSRF-Token',
      'XSRF-Token',
    ],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Oftisoft API')
    .setDescription('The Oftisoft API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('products', 'Product catalog')
    .addTag('orders', 'Order management')
    .addTag('billing', 'Payment and billing')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // API prefix
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  // Setup Socket.io
  app.useWebSocketAdapter(new IoAdapter(app));

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const port = configService.get('PORT') || 5000;
  await app.listen(port, '0.0.0.0');

  logger.log(`Backend server running on http://localhost:${port}`);
  logger.log(`API available at http://localhost:${port}/api`);
  logger.log(`API Documentation at http://localhost:${port}/api/docs`);

  // Handle process signals
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received. Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received. Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, error.stack);
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error(`Unhandled Rejection: ${reason?.message || reason}`);
  });
}
bootstrap();
