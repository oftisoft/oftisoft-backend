import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AccountLockoutService } from '../account-lockout.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private accountLockoutService: AccountLockoutService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    // Check if account is locked
    const lockoutStatus =
      await this.accountLockoutService.isAccountLocked(email);
    if (lockoutStatus.locked) {
      throw new ForbiddenException(lockoutStatus.message);
    }

    const user = await this.authService.validateUser(email, password);

    if (!user) {
      // Record failed attempt
      await this.accountLockoutService.recordFailedAttempt(email);

      // Get remaining attempts for the error message
      const remainingAttempts =
        await this.accountLockoutService.getRemainingAttempts(email);

      if (remainingAttempts <= 0) {
        const lockoutStatus =
          await this.accountLockoutService.isAccountLocked(email);
        throw new ForbiddenException(lockoutStatus.message);
      }

      throw new UnauthorizedException(
        `Invalid credentials. ${remainingAttempts} attempts remaining.`,
      );
    }

    // Record successful login and clear failed attempts
    await this.accountLockoutService.recordSuccessfulLogin(email);

    return user;
  }
}
