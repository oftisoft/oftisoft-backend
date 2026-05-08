import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Affiliate,
  AffiliateStatus,
  AffiliateTier,
} from '../entities/affiliate.entity';
import {
  AffiliateCommission,
  CommissionStatus,
  CommissionType,
} from '../entities/affiliate-commission.entity';
import { Order } from '../entities/order.entity';
import {
  AffiliateWithdrawal,
  WithdrawalStatus,
  WithdrawalMethod,
} from '../entities/affiliate-withdrawal.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AffiliateService {
  constructor(
    @InjectRepository(Affiliate)
    private affiliateRepository: Repository<Affiliate>,
    @InjectRepository(AffiliateCommission)
    private commissionRepository: Repository<AffiliateCommission>,
    @InjectRepository(AffiliateWithdrawal)
    private withdrawalRepository: Repository<AffiliateWithdrawal>,
    private dataSource: DataSource,
  ) {}

  async getAffiliateByUser(userId: string): Promise<Affiliate> {
    let affiliate = await this.affiliateRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!affiliate) {
      // Auto-create affiliate profile if not exists
      const user = { id: userId } as User;
      const referralCode = this.generateReferralCode();
      affiliate = this.affiliateRepository.create({
        user,
        referralCode,
        balance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        tier: AffiliateTier.STANDARD,
        status: AffiliateStatus.ACTIVE,
        commissionRate: 10,
        totalReferrals: 0,
        totalConversions: 0,
        totalClicks: 0,
        pendingCommissions: 0,
        clearedCommissions: 0,
        cancelledCommissions: 0,
      });
      await this.affiliateRepository.save(affiliate);
    }

    return affiliate;
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async getStats(userId: string) {
    const affiliate = await this.getAffiliateByUser(userId);

    if (affiliate.status === AffiliateStatus.BANNED) {
      throw new BadRequestException('Your affiliate account has been banned');
    }

    const commissions = await this.commissionRepository.find({
      where: { affiliate: { id: affiliate.id } },
      order: { createdAt: 'DESC' },
      relations: ['order'],
      take: 100, // Limit to last 100 for performance
    });

    const withdrawals = await this.withdrawalRepository.find({
      where: { affiliate: { id: affiliate.id } },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    // Aggregate performance from commissions (last 30 days)
    const performanceReports = await this.getPerformanceData(affiliate.id);

    // Calculate stats
    const stats = {
      profile: {
        ...affiliate,
        referralLink: `https://oftisoft.com/ref/${affiliate.referralCode}`,
      },
      commissions,
      withdrawals,
      performanceReports,
      summary: {
        totalCommissions: commissions.length,
        totalWithdrawals: withdrawals.length,
        pendingCommissionsCount: affiliate.pendingCommissions,
        clearedCommissionsCount: affiliate.clearedCommissions,
        totalClicks: affiliate.totalClicks,
        totalReferrals: affiliate.totalReferrals,
        totalConversions: affiliate.totalConversions,
        conversionRate:
          affiliate.totalReferrals > 0
            ? (
                (affiliate.totalConversions / affiliate.totalReferrals) *
                100
              ).toFixed(2)
            : 0,
      },
      tierProgress: this.calculateTierProgress(affiliate),
    };

    return stats;
  }

  private async getPerformanceData(affiliateId: string) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const performanceReports: {
      name: string;
      conversions: number;
      referrals: number;
      clicks: number;
      earnings: number;
    }[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const dayCommissions = await this.commissionRepository
        .createQueryBuilder('c')
        .where('c.affiliate.id = :affiliateId', { affiliateId })
        .andWhere('c.createdAt BETWEEN :start AND :end', {
          start: d,
          end: next,
        })
        .getMany();

      const conversions = dayCommissions.filter(
        (c) => c.status === CommissionStatus.CLEARED,
      ).length;
      const earnings = dayCommissions
        .filter((c) => c.status === CommissionStatus.CLEARED)
        .reduce((sum, c) => sum + Number(c.amount), 0);

      performanceReports.push({
        name: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : dayNames[d.getDay()],
        conversions,
        referrals: dayCommissions.length, // Approximation
        clicks: 0, // Would need click tracking table
        earnings,
      });
    }

    return performanceReports.slice(-7); // Return last 7 days for display
  }

  private calculateTierProgress(affiliate: Affiliate) {
    const tierRequirements: Record<
      AffiliateTier,
      { minEarnings: number; minReferrals: number; minConversions: number }
    > = {
      [AffiliateTier.STANDARD]: {
        minEarnings: 0,
        minReferrals: 0,
        minConversions: 0,
      },
      [AffiliateTier.BRONZE]: {
        minEarnings: 1000,
        minReferrals: 10,
        minConversions: 5,
      },
      [AffiliateTier.SILVER]: {
        minEarnings: 5000,
        minReferrals: 50,
        minConversions: 25,
      },
      [AffiliateTier.GOLD]: {
        minEarnings: 20000,
        minReferrals: 100,
        minConversions: 50,
      },
      [AffiliateTier.PLATINUM]: {
        minEarnings: 50000,
        minReferrals: 250,
        minConversions: 100,
      },
      [AffiliateTier.DIAMOND]: {
        minEarnings: 100000,
        minReferrals: 500,
        minConversions: 200,
      },
    };

    const tiers = Object.values(AffiliateTier);
    const currentIndex = tiers.indexOf(affiliate.tier);
    const nextTier = tiers[currentIndex + 1];

    if (!nextTier) {
      return {
        currentTier: affiliate.tier,
        nextTier: null,
        progress: 100,
        requirements: null,
        achieved: {
          earnings: affiliate.totalEarnings,
          referrals: affiliate.totalReferrals,
          conversions: affiliate.totalConversions,
        },
      };
    }

    const req = tierRequirements[nextTier];
    const earningsProgress = Math.min(
      100,
      (Number(affiliate.totalEarnings) / req.minEarnings) * 100,
    );
    const referralsProgress = Math.min(
      100,
      (affiliate.totalReferrals / req.minReferrals) * 100,
    );
    const conversionsProgress = Math.min(
      100,
      (affiliate.totalConversions / req.minConversions) * 100,
    );

    const overallProgress = Math.round(
      (earningsProgress + referralsProgress + conversionsProgress) / 3,
    );

    return {
      currentTier: affiliate.tier,
      nextTier,
      progress: overallProgress,
      requirements: req,
      achieved: {
        earnings: affiliate.totalEarnings,
        referrals: affiliate.totalReferrals,
        conversions: affiliate.totalConversions,
      },
    };
  }

  async requestWithdrawal(
    userId: string,
    data: { amount: number; method: WithdrawalMethod; paymentDetails?: any },
  ) {
    const affiliate = await this.getAffiliateByUser(userId);

    if (affiliate.status !== AffiliateStatus.ACTIVE) {
      throw new BadRequestException('Your affiliate account is not active');
    }

    if (Number(affiliate.balance) < data.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Minimum withdrawal check (could be configurable)
    const MIN_WITHDRAWAL = 50;
    if (data.amount < MIN_WITHDRAWAL) {
      throw new BadRequestException(
        `Minimum withdrawal amount is $${MIN_WITHDRAWAL}`,
      );
    }

    // Calculate fee (could be configurable)
    const fee = 0; // No fee for now
    const netAmount = data.amount - fee;

    // Use transaction for atomic balance update and withdrawal creation
    return await this.dataSource.transaction(async (manager) => {
      const withdrawal = manager.create(AffiliateWithdrawal, {
        affiliate,
        amount: data.amount,
        fee,
        netAmount,
        method: data.method,
        status: WithdrawalStatus.PENDING,
        notes: data.paymentDetails ? JSON.stringify(data.paymentDetails) : null,
      });

      affiliate.balance = Number(affiliate.balance) - data.amount;
      await manager.save(affiliate);

      return manager.save(withdrawal);
    });
  }

  async cancelWithdrawal(userId: string, withdrawalId: string) {
    const affiliate = await this.getAffiliateByUser(userId);

    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId, affiliate: { id: affiliate.id } },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException(
        'Only pending withdrawals can be cancelled',
      );
    }

    // Use transaction for atomic balance restoration and withdrawal cancellation
    return await this.dataSource.transaction(async (manager) => {
      withdrawal.status = WithdrawalStatus.CANCELLED;
      affiliate.balance = Number(affiliate.balance) + Number(withdrawal.amount);

      await manager.save(affiliate);
      return manager.save(withdrawal);
    });
  }

  async trackReferralClick(referralCode: string) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { referralCode },
    });

    if (affiliate && affiliate.status === AffiliateStatus.ACTIVE) {
      affiliate.totalClicks += 1;
      affiliate.lastActivityAt = new Date();
      await this.affiliateRepository.save(affiliate);
    }

    return affiliate;
  }

  async registerReferral(referralCode: string, orderId: string) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { referralCode },
    });

    if (!affiliate || affiliate.status !== AffiliateStatus.ACTIVE) {
      return null;
    }

    // Create commission
    const commissionData: Partial<AffiliateCommission> = {
      affiliate,
      order: { id: orderId } as Order,
      amount: 0,
      status: CommissionStatus.PENDING,
      type: CommissionType.SALE,
    };
    const commission = this.commissionRepository.create(commissionData);

    affiliate.totalReferrals += 1;
    affiliate.pendingCommissions += 1;
    affiliate.lastActivityAt = new Date();

    await this.affiliateRepository.save(affiliate);
    return this.commissionRepository.save(commission);
  }

  async getWithdrawalMethods() {
    return [
      {
        id: WithdrawalMethod.PAYPAL,
        name: 'PayPal',
        icon: 'paypal',
        fee: 0,
        minAmount: 50,
        processingTime: '1-3 business days',
      },
      {
        id: WithdrawalMethod.STRIPE,
        name: 'Stripe',
        icon: 'stripe',
        fee: 0,
        minAmount: 50,
        processingTime: '1-2 business days',
      },
      {
        id: WithdrawalMethod.BANK_TRANSFER,
        name: 'Bank Transfer',
        icon: 'bank',
        fee: 0,
        minAmount: 100,
        processingTime: '3-5 business days',
      },
      {
        id: WithdrawalMethod.CRYPTO,
        name: 'Crypto (USDC)',
        icon: 'crypto',
        fee: 0,
        minAmount: 100,
        processingTime: 'Instant',
      },
      {
        id: WithdrawalMethod.WISE,
        name: 'Wise',
        icon: 'wise',
        fee: 0,
        minAmount: 50,
        processingTime: '1-2 business days',
      },
      {
        id: WithdrawalMethod.PAYONEER,
        name: 'Payoneer',
        icon: 'payoneer',
        fee: 0,
        minAmount: 50,
        processingTime: '2-3 business days',
      },
    ];
  }
}
