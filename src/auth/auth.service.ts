import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(
    registerDto: RegisterDto,
    res: Response,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const { email, password, name, phone } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone,
      isEmailVerified: false,
    });

    await this.userRepository.save(user);

    // Auto-login the user after registration
    const payload = { email: user.email, sub: user.id };

    // Generate tokens
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.save({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
    });

    // Set cookies
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Remove password from response
    const { password: _, ...result } = user;
    return {
      message: 'User registered successfully',
      user: result,
      accessToken,
      isAutoLogin: true,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      console.log(`[AuthService] Login failed: User not found (${email})`);
      return null;
    }

    if (!user.password) {
      console.log(
        `[AuthService] Login failed: User exists but has no password (OAuth user?) (${email})`,
      );
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`[AuthService] Login failed: Invalid password for ${email}`);
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if email is verified (skip for OAuth users)
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email not verified. Please check your email and verify your account before logging in.',
      );
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(
    user: User,
    remember: boolean,
    res: Response,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Check if 2FA is enabled - if so, don't set cookies yet
    if (user.isTwoFactorEnabled) {
      // Generate a temporary token for 2FA verification
      const tempPayload = {
        email: user.email,
        sub: user.id,
        requires2FA: true,
      };
      const tempToken = this.jwtService.sign(tempPayload, {
        secret:
          this.configService.get<string>('JWT_2FA_SECRET') ||
          this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '5m',
      });

      const { password: _, ...userWithoutPassword } = user;
      return {
        message: '2FA verification required',
        requires2FA: true,
        user: userWithoutPassword,
        tempToken,
      };
    }

    const payload = { email: user.email, sub: user.id };

    // Generate tokens
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: remember ? '30d' : '7d',
    });

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (remember ? 30 : 7));

    await this.refreshTokenRepository.save({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
    });

    // Set cookies
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: (remember ? 30 : 7) * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      requires2FA: false,
    };
  }

  async refreshTokens(user: User, res: Response, oldRefreshToken?: string) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      tokenVersion: user.tokenVersion,
    };

    // Generate new access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    // Token Rotation: Generate new refresh token
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Calculate new expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save new refresh token
    await this.refreshTokenRepository.save({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    });

    // Revoke old refresh token if provided (token rotation)
    if (oldRefreshToken) {
      await this.refreshTokenRepository.update(
        { token: oldRefreshToken, userId: user.id },
        { isRevoked: true },
      );
    }

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Token refreshed successfully',
      accessToken,
    };
  }

  async logout(userId: string, refreshToken: string, res: Response) {
    // Revoke refresh token
    await this.refreshTokenRepository.update(
      { token: refreshToken, userId },
      { isRevoked: true },
    );

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('strict' as const) : ('lax' as const),
      path: '/',
    };

    // Clear cookies with matching options
    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return {
      message: 'Logout successful',
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, updateProfileDto: any) {
    await this.userRepository.update(userId, updateProfileDto);
    return this.getProfile(userId);
  }

  async updateAvatarUrl(userId: string, avatarUrl: string) {
    await this.userRepository.update(userId, { avatarUrl });
    return this.getProfile(userId);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user || !user.password) {
      throw new BadRequestException('User not found or password not set');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    // Increment token version to invalidate all existing tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await this.userRepository.save(user);

    // Revoke all tokens for security - force re-login with new password
    await this.revokeAllTokens(userId);

    return {
      message:
        'Password updated successfully. Please log in again with your new password.',
    };
  }

  async getSessions(userId: string) {
    return this.refreshTokenRepository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.refreshTokenRepository.update(
      { id: sessionId, userId },
      { isRevoked: true },
    );

    return {
      message: 'Session revoked successfully',
    };
  }

  async revokeAllTokens(userId: string) {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );

    return {
      message: 'All tokens revoked successfully',
    };
  }

  // ============ 2FA Methods ============

  async setup2FA(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Oftisoft (${user.email})`,
      length: 32,
    });

    // Save secret to user
    user.twoFactorSecret = secret.base32;
    await this.userRepository.save(user);

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      message: '2FA setup initiated',
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verify2FA(userId: string, code: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not set up');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps before/after
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Enable 2FA
    user.isTwoFactorEnabled = true;
    await this.userRepository.save(user);

    return {
      message: '2FA enabled successfully',
      enabled: true,
    };
  }

  async verify2FALogin(
    tempToken: string,
    code: string,
    remember: boolean,
    res: Response,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Verify the temp token
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    if (!payload.requires2FA) {
      throw new UnauthorizedException('Invalid session');
    }

    // Get user
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not set up');
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Complete login after 2FA verification
    const loginPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = this.jwtService.sign(loginPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(loginPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: remember ? '30d' : '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (remember ? 30 : 7));

    await this.refreshTokenRepository.save({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
    });

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: (remember ? 30 : 7) * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
    };
  }

  async disable2FA(userId: string, code: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Disable 2FA
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await this.userRepository.save(user);

    return {
      message: '2FA disabled successfully',
      enabled: false,
    };
  }

  // ============ Password Reset Methods ============

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return {
        message:
          'If an account exists with this email, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Set token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.userRepository.save(user);

    // Send email
    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return {
      message:
        'If an account exists with this email, a password reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // Find users with non-expired reset tokens
    const users = await this.userRepository.find({
      where: {
        resetPasswordExpires: MoreThan(new Date()),
      },
      select: ['id', 'password', 'resetPasswordToken', 'resetPasswordExpires'],
    });

    let user: User | null = null;

    // Check each user's hashed token (tokens are hashed so we must compare)
    for (const u of users) {
      if (u.resetPasswordToken) {
        const isValid = await bcrypt.compare(token, u.resetPasswordToken);
        if (isValid) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);

    // Revoke all existing tokens for security
    await this.revokeAllTokens(user.id);

    return {
      message: 'Password reset successfully',
    };
  }

  async verifyResetToken(token: string) {
    // Find users with non-expired reset tokens
    const users = await this.userRepository.find({
      where: {
        resetPasswordExpires: MoreThan(new Date()),
      },
      select: ['id', 'resetPasswordToken', 'resetPasswordExpires'],
    });

    for (const user of users) {
      if (user.resetPasswordToken) {
        const isValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (isValid) {
          return {
            valid: true,
            message: 'Token is valid',
          };
        }
      }
    }

    return {
      valid: false,
      message: 'Invalid or expired token',
    };
  }

  // ============ OAuth Methods ============

  async findOrCreateFromGoogle(profile: {
    id: string;
    emails?: { value: string; verified?: boolean }[];
    displayName?: string;
  }): Promise<User> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new BadRequestException('Google profile missing email');
    }

    let user = await this.userRepository.findOne({
      where: [{ email }, { googleId: profile.id }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        await this.userRepository.save(user);
      }
      return user;
    }

    user = this.userRepository.create({
      email,
      name: profile.displayName || email.split('@')[0],
      phone: '',
      password: null,
      googleId: profile.id,
      githubId: null,
      isEmailVerified: profile.emails?.[0]?.verified ?? true,
    });
    return this.userRepository.save(user);
  }

  async findOrCreateFromGithub(profile: {
    id: string;
    emails?: { value: string; verified?: boolean }[];
    username?: string;
    displayName?: string;
  }): Promise<User> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new BadRequestException('GitHub profile missing email');
    }

    let user = await this.userRepository.findOne({
      where: [{ email }, { githubId: profile.id }],
    });

    if (user) {
      if (!user.githubId) {
        user.githubId = profile.id;
        await this.userRepository.save(user);
      }
      return user;
    }

    user = this.userRepository.create({
      email,
      name: profile.displayName || profile.username || email.split('@')[0],
      phone: '',
      password: null,
      googleId: null,
      githubId: profile.id,
      isEmailVerified: profile.emails?.[0]?.verified ?? true,
    });
    return this.userRepository.save(user);
  }
}
