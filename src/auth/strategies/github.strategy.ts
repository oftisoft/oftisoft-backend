import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        const clientID = configService.get<string>('GITHUB_CLIENT_ID');
        const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');
        super({
            clientID: clientID || 'not-configured',
            clientSecret: clientSecret || 'not-configured',
            callbackURL: `${configService.get<string>('API_URL') || 'http://localhost:5000'}/api/auth/github/callback`,
            scope: ['user:email'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: {
            id: string;
            emails?: { value: string; verified?: boolean }[];
            username?: string;
            displayName?: string;
        },
        done: (err: Error | null, user?: any) => void,
    ) {
        try {
            const user = await this.authService.findOrCreateFromGithub({
                id: profile.id,
                emails: profile.emails,
                username: profile.username,
                displayName: profile.displayName,
            });
            done(null, user);
        } catch (err) {
            done(err as Error, undefined);
        }
    }
}
