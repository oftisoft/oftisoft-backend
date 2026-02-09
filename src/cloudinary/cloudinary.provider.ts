import { v2 } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
    provide: 'CLOUDINARY',
    useFactory: (configService: ConfigService) => {
        // If CLOUDINARY_URL is set in env, v2.config() without args might pick it up automatically
        // but explicit config is safer if we want to rely on ConfigService abstraction
        const cloudinaryUrl = configService.get<string>('CLOUDINARY_URL');

        // If the URL is provided, we can parse it or let cloudinary handle it. 
        // But for clarity, we can also set it explicitly if needed.
        // For now, return v2 which will use the environment variable.
        return v2;
    },
    inject: [ConfigService],
};
