import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { User } from '../entities/user.entity';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerificationToken)
    private tokenRepository: Repository<EmailVerificationToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createVerificationToken(userId: string): Promise<string> {
    // Delete any existing unused tokens for this user
    await this.tokenRepository.delete({ userId, isUsed: false });

    // Generate secure random token
    const token = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);

    // Token expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const verificationToken = this.tokenRepository.create({
      token: hashedToken,
      userId,
      expiresAt,
      isUsed: false,
    });

    await this.tokenRepository.save(verificationToken);

    return token;
  }

  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string; email?: string }> {
    // Find all unused tokens that haven't expired
    const tokens = await this.tokenRepository.find({
      where: {
        isUsed: false,
        expiresAt: LessThan(new Date()),
      },
      relations: ['user'],
    });

    // Check each token
    let validToken: EmailVerificationToken | null = null;
    for (const t of tokens) {
      if (await bcrypt.compare(token, t.token)) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      return {
        success: false,
        message: 'Invalid or expired verification token',
      };
    }

    // Mark token as used
    validToken.isUsed = true;
    await this.tokenRepository.save(validToken);

    // Mark user as verified
    await this.userRepository.update(validToken.userId, {
      isEmailVerified: true,
    });

    const user = await this.userRepository.findOne({
      where: { id: validToken.userId },
    });

    return {
      success: true,
      message: 'Email verified successfully',
      email: user?.email,
    };
  }

  async resendVerificationEmail(
    userId: string,
  ): Promise<{ token: string; email: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Rate limiting: Check if token was created recently (min 1 minute between resends)
    const existingToken = await this.tokenRepository.findOne({
      where: { userId, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (existingToken) {
      const timeSinceLastToken = Date.now() - existingToken.createdAt.getTime();
      const minInterval = 60 * 1000; // 1 minute

      if (timeSinceLastToken < minInterval) {
        const waitSeconds = Math.ceil(
          (minInterval - timeSinceLastToken) / 1000,
        );
        throw new BadRequestException(
          `Please wait ${waitSeconds} seconds before requesting another email`,
        );
      }
    }

    const token = await this.createVerificationToken(userId);

    return {
      token,
      email: user.email,
    };
  }

  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['isEmailVerified'],
    });
    return user?.isEmailVerified ?? false;
  }
}
