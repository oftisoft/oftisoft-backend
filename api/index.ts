import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// Cache the app instance
let cachedServer;

export default async function handler(req, res) {
    if (!cachedServer) {
        const app = await NestFactory.create(AppModule);
        const configService = app.get(ConfigService);

        // Replicate settings from main.ts
        // Security middleware
        app.use(helmet({
            crossOriginResourcePolicy: { policy: "cross-origin" }
        }));
        app.use(cookieParser(configService.get('COOKIE_SECRET')));

        // CORS configuration
        const frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:3000';
        app.enableCors({
            origin: [frontendUrl, 'http://localhost:3000'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Client-Version'],
        });

        // Global validation pipe
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        // API prefix configuration
        // We must exclude the root '/' path so it can serve the HTML landing page
        app.setGlobalPrefix('api', {
            exclude: [{ path: '/', method: RequestMethod.GET }],
        });

        await app.init();
        cachedServer = app.getHttpAdapter().getInstance();
    }

    return cachedServer(req, res);
}
