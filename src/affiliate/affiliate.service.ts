import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Affiliate } from '../entities/affiliate.entity';
import { AffiliateCommission } from '../entities/affiliate-commission.entity';
import { AffiliateWithdrawal } from '../entities/affiliate-withdrawal.entity';
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
    ) { }

    async getAffiliateByUser(userId: string): Promise<Affiliate> {
        let affiliate = await this.affiliateRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });

        if (!affiliate) {
            // Auto-create affiliate profile if not exists
            const user = { id: userId } as User;
            const referralCode = `ref_${Math.random().toString(36).substring(2, 8)}`;
            affiliate = this.affiliateRepository.create({
                user,
                referralCode,
                balance: 0,
                totalEarnings: 0,
            });
            await this.affiliateRepository.save(affiliate);
        }

        return affiliate;
    }

    async getStats(userId: string) {
        const affiliate = await this.getAffiliateByUser(userId);
        const commissions = await this.commissionRepository.find({
            where: { affiliate: { id: affiliate.id } },
            order: { createdAt: 'DESC' },
            relations: ['order']
        });

        const withdrawals = await this.withdrawalRepository.find({
            where: { affiliate: { id: affiliate.id } },
            order: { createdAt: 'DESC' }
        });

        // Mock performance reports for the chart (normally aggregated from commissions)
        const performanceReports = [
            { name: "Mon", conversions: 4, referrals: 10 },
            { name: "Tue", conversions: 3, referrals: 12 },
            { name: "Wed", conversions: 7, referrals: 8 },
            { name: "Thu", conversions: 2, referrals: 15 },
            { name: "Fri", conversions: 6, referrals: 11 },
            { name: "Sat", conversions: 3, referrals: 7 },
            { name: "Sun", conversions: 1, referrals: 5 },
        ];

        return {
            profile: affiliate,
            commissions,
            withdrawals,
            performanceReports
        };
    }

    async requestWithdrawal(userId: string, data: { amount: number; method: string }) {
        const affiliate = await this.getAffiliateByUser(userId);
        if (Number(affiliate.balance) < data.amount) {
            throw new Error('Insufficient balance');
        }

        const withdrawal = this.withdrawalRepository.create({
            affiliate,
            amount: data.amount,
            method: data.method,
            status: 'pending'
        });

        affiliate.balance = Number(affiliate.balance) - data.amount;
        await this.affiliateRepository.save(affiliate);
        return this.withdrawalRepository.save(withdrawal);
    }
}
