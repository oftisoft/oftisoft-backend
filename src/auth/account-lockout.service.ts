import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { FailedLoginAttempt } from '../entities/failed-login-attempt.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AccountLockoutService {
  constructor(
    @InjectRepository(FailedLoginAttempt)
    private failedLoginRepository: Repository<FailedLoginAttempt>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Configuration
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;
  private readonly FAILED_ATTEMPT_WINDOW_MINUTES = 15;

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(email: string, ipAddress?: string): Promise<void> {
    const attempt = this.failedLoginRepository.create({
      email: email.toLowerCase(),
      ipAddress: ipAddress || null,
      successful: false,
    });

    await this.failedLoginRepository.save(attempt);
  }

  /**
   * Record a successful login and clear failed attempts
   */
  async recordSuccessfulLogin(email: string): Promise<void> {
    // Delete failed attempts for this email
    await this.failedLoginRepository.delete({
      email: email.toLowerCase(),
    });
  }

  /**
   * Check if an account should be locked
   */
  async isAccountLocked(
    email: string,
  ): Promise<{ locked: boolean; message?: string; remainingMinutes?: number }> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(
      cutoffTime.getMinutes() - this.FAILED_ATTEMPT_WINDOW_MINUTES,
    );

    // Count recent failed attempts
    const failedAttempts = await this.failedLoginRepository.count({
      where: {
        email: email.toLowerCase(),
        successful: false,
        createdAt: MoreThan(cutoffTime),
      },
    });

    if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      // Get the most recent failed attempt
      const mostRecentAttempt = await this.failedLoginRepository.findOne({
        where: {
          email: email.toLowerCase(),
          successful: false,
        },
        order: { createdAt: 'DESC' },
      });

      if (mostRecentAttempt) {
        const lockoutEndTime = new Date(mostRecentAttempt.createdAt);
        lockoutEndTime.setMinutes(
          lockoutEndTime.getMinutes() + this.LOCKOUT_DURATION_MINUTES,
        );

        const remainingMinutes = Math.ceil(
          (lockoutEndTime.getTime() - Date.now()) / (1000 * 60),
        );

        if (remainingMinutes > 0) {
          return {
            locked: true,
            message: `Account locked due to too many failed attempts. Please try again in ${remainingMinutes} minutes.`,
            remainingMinutes,
          };
        }
      }
    }

    return { locked: false };
  }

  /**
   * Get remaining attempts for an account
   */
  async getRemainingAttempts(email: string): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(
      cutoffTime.getMinutes() - this.FAILED_ATTEMPT_WINDOW_MINUTES,
    );

    const failedAttempts = await this.failedLoginRepository.count({
      where: {
        email: email.toLowerCase(),
        successful: false,
        createdAt: MoreThan(cutoffTime),
      },
    });

    return Math.max(0, this.MAX_FAILED_ATTEMPTS - failedAttempts);
  }

  /**
   * Clean up old failed attempts (run periodically)
   */
  async cleanupOldAttempts(): Promise<void> {
    const cutoffTime = new Date();
    cutoffTime.setDate(cutoffTime.getDate() - 1); // Keep 1 day of history

    await this.failedLoginRepository.delete({
      createdAt: LessThan(cutoffTime),
    });
  }
}

// Import MoreThan for the query
import { MoreThan } from 'typeorm';
