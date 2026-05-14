import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';

import { S3Service } from '../s3/s3.service';
import { EmailVerificationService } from './email-verification.service';
import { EmailService } from './email.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private s3Service: S3Service,
    private emailVerificationService: EmailVerificationService,
    private emailService: EmailService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await this.authService.register(
      registerDto,
      res,
      userAgent,
      ipAddress,
    );

    // Create and send verification token
    try {
      const token = await this.emailVerificationService.createVerificationToken(
        result.user.id,
      );
      await this.emailService.sendEmailVerificationEmail(
        registerDto.email,
        token,
      );
    } catch (error) {
      this.logger.error('Failed to send verification email', error instanceof Error ? error.stack : String(error));
      // Don't fail registration if email fails
    }

    return result;
  }

  // ============ Email Verification Endpoints ============

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return this.emailVerificationService.verifyEmail(token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@GetUser() user: User) {
    const { token, email } =
      await this.emailVerificationService.resendVerificationEmail(user.id);
    await this.emailService.sendEmailVerificationEmail(email, token);

    return {
      message: 'Verification email sent successfully',
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @GetUser() user: User,
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const remember = loginDto.remember || false;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.login(user, remember, res, userAgent, ipAddress);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.['refresh_token']; // Safely access cookies
    return this.authService.logout(user.id, refreshToken, res);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.['refresh_token'];
    return this.authService.refreshTokens(user, res, refreshToken);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const result = await this.s3Service.uploadImage(file, 'avatars');
    return this.authService.updateAvatarUrl(user.id, result.url);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@GetUser() user: User) {
    return this.authService.getSessions(user.id);
  }

  @Post('sessions/revoke/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(@GetUser() user: User, @Param('id') sessionId: string) {
    return this.authService.revokeSession(user.id, sessionId);
  }

  @Post('revoke-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeAllTokens(@GetUser() user: User) {
    return this.authService.revokeAllTokens(user.id);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAuth(@GetUser() user: User) {
    const { password: _, ...userWithoutPassword } = user;
    return {
      authenticated: true,
      user: userWithoutPassword,
    };
  }

  // ============ 2FA Endpoints ============

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async setup2FA(@GetUser() user: User) {
    return this.authService.setup2FA(user.id);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verify2FA(@GetUser() user: User, @Body() verify2FADto: Verify2FADto) {
    return this.authService.verify2FA(user.id, verify2FADto.code);
  }

  @Post('2fa/verify-login')
  @HttpCode(HttpStatus.OK)
  async verify2FALogin(
    @Body() body: { tempToken: string; code: string; remember?: boolean },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.verify2FALogin(
      body.tempToken,
      body.code,
      body.remember || false,
      res,
      userAgent,
      ipAddress,
    );
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disable2FA(@GetUser() user: User, @Body() verify2FADto: Verify2FADto) {
    return this.authService.disable2FA(user.id, verify2FADto.code);
  }

  // ============ Password Reset Endpoints ============

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @Get('verify-reset-token')
  @HttpCode(HttpStatus.OK)
  async verifyResetToken(@Query('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  // ============ OAuth ============

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @GetUser() user: User,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket?.remoteAddress;
    await this.authService.login(user, true, res, userAgent, ipAddress);
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @GetUser() user: User,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket?.remoteAddress;
    await this.authService.login(user, true, res, userAgent, ipAddress);
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard`);
  }
}
