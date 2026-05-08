import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { EmailService } from './email.service';

interface LoginOtpStore {
  email: string;
  otp: string;
  expiresAt: Date;
}

@Controller('auth')
export class EmailLoginController {
  private otpStore: Map<string, LoginOtpStore> = new Map();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  @Post('send-login-otp')
  @HttpCode(HttpStatus.OK)
  async sendLoginOtp(@Body('email') email: string) {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        success: false,
        message: 'If an account exists with this email, an OTP has been sent',
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    this.otpStore.set(email, {
      email,
      otp,
      expiresAt,
    });

    // Send OTP email
    try {
      await this.emailService.sendLoginOtpEmail(email, otp);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
    }

    return {
      success: true,
      message: 'OTP sent to your email',
    };
  }

  @Post('verify-login-otp')
  @HttpCode(HttpStatus.OK)
  async verifyLoginOtp(@Body('email') email: string, @Body('otp') otp: string) {
    const storedData = this.otpStore.get(email);

    if (!storedData) {
      return {
        success: false,
        message: 'OTP expired or invalid',
      };
    }

    if (new Date() > storedData.expiresAt) {
      this.otpStore.delete(email);
      return {
        success: false,
        message: 'OTP has expired',
      };
    }

    if (storedData.otp !== otp) {
      return {
        success: false,
        message: 'Invalid OTP',
      };
    }

    // OTP verified, clear it
    this.otpStore.delete(email);

    // Get user
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: 'Account is deactivated',
      };
    }

    // Return success
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
