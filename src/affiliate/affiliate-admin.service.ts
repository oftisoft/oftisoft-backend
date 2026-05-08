import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  Affiliate,
  AffiliateStatus,
  AffiliateTier,
} from '../entities/affiliate.entity';
import {
  AffiliateCommission,
  CommissionStatus,
} from '../entities/affiliate-commission.entity';
import {
  AffiliateWithdrawal,
  WithdrawalStatus,
} from '../entities/affiliate-withdrawal.entity';
import { User } from '../entities/user.entity';

export interface AffiliateFilters {
  status?: AffiliateStatus;
  tier?: AffiliateTier;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CommissionFilters {
  status?: CommissionStatus;
  affiliateId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface WithdrawalFilters {
  status?: WithdrawalStatus;
  affiliateId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MonthlyPerformance {
  month: string;
  commissions: number;
  withdrawals: number;
  newAffiliates: number;
}

@Injectable()
export class AffiliateAdminService {
  constructor(
    @InjectRepository(Affiliate)
    private affiliateRepository: Repository<Affiliate>,
    @InjectRepository(AffiliateCommission)
    private commissionRepository: Repository<AffiliateCommission>,
    @InjectRepository(AffiliateWithdrawal)
    private withdrawalRepository: Repository<AffiliateWithdrawal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ========== DASHBOARD ANALYTICS ==========

  async getDashboardStats() {
    const rawPayout = await this.withdrawalRepository
      .createQueryBuilder('w')
      .select('SUM(w.amount)', 'total')
      .where('w.status = :status', { status: WithdrawalStatus.COMPLETED })
      .getRawOne<{ total: string | null }>();

    const rawCommission = await this.commissionRepository
      .createQueryBuilder('c')
      .select('SUM(c.amount)', 'total')
      .where('c.status = :status', { status: CommissionStatus.CLEARED })
      .getRawOne<{ total: string | null }>();

    const rawPending = await this.commissionRepository
      .createQueryBuilder('c')
      .select('SUM(c.amount)', 'total')
      .where('c.status = :status', { status: CommissionStatus.PENDING })
      .getRawOne<{ total: string | null }>();

    const [
      totalAffiliates,
      activeAffiliates,
      pendingAffiliates,
      suspendedAffiliates,
      totalCommissions,
      pendingCommissions,
      clearedCommissions,
      totalWithdrawals,
      pendingWithdrawals,
    ] = await Promise.all([
      this.affiliateRepository.count(),
      this.affiliateRepository.count({
        where: { status: AffiliateStatus.ACTIVE },
      }),
      this.affiliateRepository.count({
        where: { status: AffiliateStatus.PENDING },
      }),
      this.affiliateRepository.count({
        where: { status: AffiliateStatus.SUSPENDED },
      }),
      this.commissionRepository.count(),
      this.commissionRepository.count({
        where: { status: CommissionStatus.PENDING },
      }),
      this.commissionRepository.count({
        where: { status: CommissionStatus.CLEARED },
      }),
      this.withdrawalRepository.count(),
      this.withdrawalRepository.count({
        where: { status: WithdrawalStatus.PENDING },
      }),
    ]);

    const totalPayout = Number(rawPayout?.total ?? 0);
    const totalCommissionAmount = Number(rawCommission?.total ?? 0);
    const pendingCommissionAmount = Number(rawPending?.total ?? 0);

    // Monthly performance data (last 6 months)
    const monthlyData = await this.getMonthlyPerformance();

    // Top affiliates
    const topAffiliates = await this.getTopAffiliates(10);

    return {
      overview: {
        totalAffiliates,
        activeAffiliates,
        pendingAffiliates,
        suspendedAffiliates,
        totalCommissions,
        pendingCommissions,
        clearedCommissions,
        totalWithdrawals,
        pendingWithdrawals,
        totalPayout,
        totalCommissionAmount,
        pendingCommissionAmount,
      },
      monthlyPerformance: monthlyData,
      topAffiliates,
    };
  }

  private async getMonthlyPerformance(): Promise<MonthlyPerformance[]> {
    const months: MonthlyPerformance[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [commissions, withdrawals, newAffiliates] = await Promise.all([
        this.commissionRepository
          .createQueryBuilder('c')
          .select('SUM(c.amount)', 'total')
          .where('c.createdAt BETWEEN :start AND :end', {
            start: date,
            end: endOfMonth,
          })
          .getRawOne<{ total: string | null }>(),
        this.withdrawalRepository
          .createQueryBuilder('w')
          .select('SUM(w.amount)', 'total')
          .where('w.createdAt BETWEEN :start AND :end AND w.status = :status', {
            start: date,
            end: endOfMonth,
            status: WithdrawalStatus.COMPLETED,
          })
          .getRawOne<{ total: string | null }>(),
        this.affiliateRepository.count({
          where: {
            createdAt: Between(date, endOfMonth),
          },
        }),
      ]);

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        commissions: Number(commissions?.total ?? 0),
        withdrawals: Number(withdrawals?.total ?? 0),
        newAffiliates,
      });
    }

    return months;
  }

  private async getTopAffiliates(limit: number) {
    return this.affiliateRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'user')
      .select([
        'a.id',
        'a.totalEarnings',
        'a.totalReferrals',
        'a.totalConversions',
        'a.tier',
        'a.status',
        'user.name',
        'user.email',
      ])
      .orderBy('a.totalEarnings', 'DESC')
      .limit(limit)
      .getMany();
  }

  // ========== AFFILIATE MANAGEMENT ==========

  async getAllAffiliates(
    filters: AffiliateFilters,
    page: number = 1,
    limit: number = 20,
  ) {
    const queryBuilder = this.affiliateRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'user')
      .select([
        'a.id',
        'a.referralCode',
        'a.totalEarnings',
        'a.balance',
        'a.totalWithdrawn',
        'a.tier',
        'a.status',
        'a.commissionRate',
        'a.totalReferrals',
        'a.totalConversions',
        'a.totalClicks',
        'a.pendingCommissions',
        'a.clearedCommissions',
        'a.cancelledCommissions',
        'a.lastActivityAt',
        'a.approvedAt',
        'a.createdAt',
        'a.updatedAt',
        'user.id',
        'user.name',
        'user.email',
        'user.avatarUrl',
      ]);

    if (filters.status) {
      queryBuilder.andWhere('a.status = :status', { status: filters.status });
    }

    if (filters.tier) {
      queryBuilder.andWhere('a.tier = :tier', { tier: filters.tier });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR a.referralCode ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('a.createdAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('a.createdAt <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    const [affiliates, total] = await queryBuilder
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: affiliates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAffiliateById(id: string) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    // Get recent activity
    const recentCommissions = await this.commissionRepository.find({
      where: { affiliate: { id } },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const recentWithdrawals = await this.withdrawalRepository.find({
      where: { affiliate: { id } },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      affiliate,
      recentCommissions,
      recentWithdrawals,
    };
  }

  async approveAffiliate(affiliateId: string, adminId: string) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    affiliate.status = AffiliateStatus.ACTIVE;
    affiliate.approvedAt = new Date();
    affiliate.approvedBy = adminId;

    return this.affiliateRepository.save(affiliate);
  }

  async suspendAffiliate(
    affiliateId: string,
    adminId: string,
    reason?: string,
  ) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    affiliate.status = AffiliateStatus.SUSPENDED;
    affiliate.notes = reason || affiliate.notes;

    return this.affiliateRepository.save(affiliate);
  }

  async banAffiliate(affiliateId: string, adminId: string, reason?: string) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    affiliate.status = AffiliateStatus.BANNED;
    affiliate.notes = reason || affiliate.notes;

    return this.affiliateRepository.save(affiliate);
  }

  async updateAffiliateTier(affiliateId: string, tier: AffiliateTier) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    affiliate.tier = tier;

    // Update commission rate based on tier
    const tierRates: Record<AffiliateTier, number> = {
      [AffiliateTier.STANDARD]: 10,
      [AffiliateTier.BRONZE]: 15,
      [AffiliateTier.SILVER]: 20,
      [AffiliateTier.GOLD]: 25,
      [AffiliateTier.PLATINUM]: 30,
      [AffiliateTier.DIAMOND]: 35,
    };

    affiliate.commissionRate = tierRates[tier];

    return this.affiliateRepository.save(affiliate);
  }

  async updateAffiliateRate(affiliateId: string, rate: number) {
    if (rate < 0 || rate > 100) {
      throw new BadRequestException(
        'Commission rate must be between 0 and 100',
      );
    }

    const affiliate = await this.affiliateRepository.findOne({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    affiliate.commissionRate = rate;
    return this.affiliateRepository.save(affiliate);
  }

  async addNote(affiliateId: string, note: string) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    affiliate.notes = affiliate.notes
      ? `${affiliate.notes}\n\n[${new Date().toISOString()}] ${note}`
      : `[${new Date().toISOString()}] ${note}`;

    return this.affiliateRepository.save(affiliate);
  }

  // ========== COMMISSION MANAGEMENT ==========

  async getAllCommissions(
    filters: CommissionFilters,
    page: number = 1,
    limit: number = 20,
  ) {
    const queryBuilder = this.commissionRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.affiliate', 'affiliate')
      .leftJoinAndSelect('affiliate.user', 'user')
      .leftJoinAndSelect('c.order', 'order');

    if (filters.status) {
      queryBuilder.andWhere('c.status = :status', { status: filters.status });
    }

    if (filters.affiliateId) {
      queryBuilder.andWhere('affiliate.id = :affiliateId', {
        affiliateId: filters.affiliateId,
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('c.createdAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('c.createdAt <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    const [commissions, total] = await queryBuilder
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: commissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveCommission(commissionId: string, adminId: string) {
    const commission = await this.commissionRepository.findOne({
      where: { id: commissionId },
      relations: ['affiliate'],
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    if (commission.status !== CommissionStatus.PENDING) {
      throw new BadRequestException('Commission is not pending');
    }

    commission.status = CommissionStatus.CLEARED;
    commission.clearedAt = new Date();
    commission.processedBy = adminId;

    // Update affiliate stats
    const affiliate = commission.affiliate;
    affiliate.balance += Number(commission.amount);
    affiliate.totalEarnings += Number(commission.amount);
    affiliate.pendingCommissions -= 1;
    affiliate.clearedCommissions += 1;
    affiliate.lastActivityAt = new Date();

    await this.affiliateRepository.save(affiliate);
    return this.commissionRepository.save(commission);
  }

  async rejectCommission(
    commissionId: string,
    adminId: string,
    reason: string,
  ) {
    const commission = await this.commissionRepository.findOne({
      where: { id: commissionId },
      relations: ['affiliate'],
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    if (commission.status !== CommissionStatus.PENDING) {
      throw new BadRequestException('Commission is not pending');
    }

    commission.status = CommissionStatus.CANCELLED;
    commission.cancelledAt = new Date();
    commission.processedBy = adminId;
    commission.notes = reason;

    // Update affiliate stats
    const affiliate = commission.affiliate;
    affiliate.pendingCommissions -= 1;
    affiliate.cancelledCommissions += 1;

    await this.affiliateRepository.save(affiliate);
    return this.commissionRepository.save(commission);
  }

  async bulkApproveCommissions(commissionIds: string[], adminId: string) {
    const results: { id: string; status: string; data?: AffiliateCommission; error?: string }[] = [];
    for (const id of commissionIds) {
      try {
        const result = await this.approveCommission(id, adminId);
        results.push({ id, status: 'success', data: result });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.push({ id, status: 'error', error: message });
      }
    }
    return results;
  }

  // ========== WITHDRAWAL MANAGEMENT ==========

  async getAllWithdrawals(
    filters: WithdrawalFilters,
    page: number = 1,
    limit: number = 20,
  ) {
    const queryBuilder = this.withdrawalRepository
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.affiliate', 'affiliate')
      .leftJoinAndSelect('affiliate.user', 'user');

    if (filters.status) {
      queryBuilder.andWhere('w.status = :status', { status: filters.status });
    }

    if (filters.affiliateId) {
      queryBuilder.andWhere('affiliate.id = :affiliateId', {
        affiliateId: filters.affiliateId,
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('w.createdAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('w.createdAt <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    const [withdrawals, total] = await queryBuilder
      .orderBy('w.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: withdrawals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveWithdrawal(withdrawalId: string, adminId: string) {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId },
      relations: ['affiliate'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Withdrawal is not pending');
    }

    withdrawal.status = WithdrawalStatus.APPROVED;
    withdrawal.approvedAt = new Date();
    withdrawal.approvedBy = adminId;

    return this.withdrawalRepository.save(withdrawal);
  }

  async completeWithdrawal(
    withdrawalId: string,
    adminId: string,
    transactionId: string,
  ) {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId },
      relations: ['affiliate'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (
      withdrawal.status !== WithdrawalStatus.APPROVED &&
      withdrawal.status !== WithdrawalStatus.PROCESSING
    ) {
      throw new BadRequestException('Withdrawal is not approved or processing');
    }

    withdrawal.status = WithdrawalStatus.COMPLETED;
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = adminId;
    withdrawal.transactionId = transactionId;

    // Update affiliate stats
    const affiliate = withdrawal.affiliate;
    affiliate.totalWithdrawn += Number(withdrawal.amount);

    await this.affiliateRepository.save(affiliate);
    return this.withdrawalRepository.save(withdrawal);
  }

  async rejectWithdrawal(
    withdrawalId: string,
    adminId: string,
    reason: string,
  ) {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId },
      relations: ['affiliate'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status === WithdrawalStatus.COMPLETED) {
      throw new BadRequestException('Cannot reject completed withdrawal');
    }

    withdrawal.status = WithdrawalStatus.REJECTED;
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectedBy = adminId;
    withdrawal.rejectionReason = reason;

    // Refund the amount
    const affiliate = withdrawal.affiliate;
    affiliate.balance += Number(withdrawal.amount);

    await this.affiliateRepository.save(affiliate);
    return this.withdrawalRepository.save(withdrawal);
  }

  async processWithdrawal(withdrawalId: string, adminId: string) {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId },
      relations: ['affiliate'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== WithdrawalStatus.APPROVED) {
      throw new BadRequestException('Withdrawal must be approved first');
    }

    withdrawal.status = WithdrawalStatus.PROCESSING;

    return this.withdrawalRepository.save(withdrawal);
  }

  // ========== SETTINGS ==========

  getSettings(): Record<string, unknown> {
    // Return default settings - in production, these would be stored in a database
    return {
      defaultCommissionRate: 10,
      minimumWithdrawalAmount: 50,
      withdrawalFee: 0,
      autoApproveCommissions: false,
      autoApproveWithdrawals: false,
      requireApproval: true,
      allowedPaymentMethods: ['paypal', 'stripe', 'bank_transfer'],
      tierRequirements: {
        [AffiliateTier.STANDARD]: { minEarnings: 0, minReferrals: 0 },
        [AffiliateTier.BRONZE]: { minEarnings: 1000, minReferrals: 10 },
        [AffiliateTier.SILVER]: { minEarnings: 5000, minReferrals: 50 },
        [AffiliateTier.GOLD]: { minEarnings: 20000, minReferrals: 100 },
        [AffiliateTier.PLATINUM]: { minEarnings: 50000, minReferrals: 250 },
        [AffiliateTier.DIAMOND]: { minEarnings: 100000, minReferrals: 500 },
      },
    };
  }

  updateSettings(settings: Record<string, unknown>): Record<string, unknown> {
    // In production, save to database
    return settings;
  }
}
