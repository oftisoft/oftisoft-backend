import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { FailedLoginAttempt } from '../entities/failed-login-attempt.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { EmailService } from './email.service';
import { S3Module } from '../s3/s3.module';
import { EmailVerificationService } from './email-verification.service';
import { AccountLockoutService } from './account-lockout.service';
import { EmailLoginController } from './email-login.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      EmailVerificationToken,
      FailedLoginAttempt,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
    S3Module,
    UsersModule,
  ],
  controllers: [AuthController, EmailLoginController],
  providers: [
    AuthService,
    EmailService,
    EmailVerificationService,
    AccountLockoutService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
  exports: [AuthService, EmailService],
})
export class AuthModule {}
