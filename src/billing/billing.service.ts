import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BillingService {
    constructor(
        @InjectRepository(PaymentMethod)
        private paymentMethodRepository: Repository<PaymentMethod>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async updateSubscription(user: User, plan: string): Promise<User> {
        user.subscriptionPlan = plan;
        user.subscriptionStatus = 'active';

        // Add a transaction record for the upgrade
        let amount = "$0.00";
        if (plan === "Pro") amount = "$29.00";
        if (plan === "Business") amount = "$99.00";

        await this.createTransaction(user, {
            invoiceId: `SUB-${Date.now()}`,
            amount,
            type: `${plan} Plan Upgrade`,
            status: 'completed',
        });

        return this.userRepository.save(user);
    }

    async getPaymentMethods(user: User): Promise<PaymentMethod[]> {
        return this.paymentMethodRepository.find({
            where: { user: { id: user.id } },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }

    async addPaymentMethod(user: User, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
        const isFirst = (await this.paymentMethodRepository.count({ where: { user: { id: user.id } } })) === 0;

        const paymentMethod = this.paymentMethodRepository.create({
            ...data,
            user,
            isDefault: isFirst || data.isDefault,
        });

        if (paymentMethod.isDefault) {
            await this.paymentMethodRepository.update(
                { user: { id: user.id } },
                { isDefault: false },
            );
        }

        return this.paymentMethodRepository.save(paymentMethod);
    }

    async setDefaultPaymentMethod(user: User, id: string): Promise<PaymentMethod> {
        await this.paymentMethodRepository.update(
            { user: { id: user.id } },
            { isDefault: false },
        );

        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id, user: { id: user.id } },
        });

        if (!paymentMethod) {
            throw new NotFoundException('Payment method not found');
        }

        paymentMethod.isDefault = true;
        return this.paymentMethodRepository.save(paymentMethod);
    }

    async deletePaymentMethod(user: User, id: string): Promise<void> {
        const result = await this.paymentMethodRepository.delete({
            id,
            user: { id: user.id },
        });

        if (result.affected === 0) {
            throw new NotFoundException('Payment method not found');
        }

        // If we deleted the default one, set another one as default if exists
        const remaining = await this.paymentMethodRepository.find({
            where: { user: { id: user.id } },
            order: { createdAt: 'DESC' },
        });

        if (remaining.length > 0 && !remaining.some(pm => pm.isDefault)) {
            remaining[0].isDefault = true;
            await this.paymentMethodRepository.save(remaining[0]);
        }
    }

    async getTransactions(user: User): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: { user: { id: user.id } },
            order: { createdAt: 'DESC' },
            take: 10,
        });
    }

    async getUsageStats(user: User) {
        // Mocking usage stats based on plan
        const plan = user.subscriptionPlan || 'Starter';
        const stats = {
            storage: {
                used: plan === 'Starter' ? '0.4GB' : plan === 'Pro' ? '45GB' : '150GB',
                total: plan === 'Starter' ? '0.5GB' : plan === 'Pro' ? '100GB' : '1TB',
                percent: plan === 'Starter' ? 80 : plan === 'Pro' ? 45 : 15,
            },
            apiCalls: {
                used: plan === 'Starter' ? '450' : plan === 'Pro' ? '8.2k' : '45k',
                total: plan === 'Starter' ? '500' : plan === 'Pro' ? '10k' : 'Unlimited',
                percent: plan === 'Starter' ? 90 : plan === 'Pro' ? 82 : 10,
            }
        };
        return stats;
    }

    async createTransaction(user: User, data: Partial<Transaction>): Promise<Transaction> {
        const transaction = this.transactionRepository.create({
            ...data,
            user,
        });
        return this.transactionRepository.save(transaction);
    }

    async getAllTransactions(): Promise<Transaction[]> {
        return this.transactionRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async getFinanceStats() {
        const transactions = await this.transactionRepository.find({
            where: { status: 'completed' }
        });

        const totalBalance = transactions.reduce((sum, t) => {
            const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ""));
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const pendingTransactions = await this.transactionRepository.find({
            where: { status: 'pending' }
        });

        const pendingSales = pendingTransactions.reduce((sum, t) => {
            const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ""));
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        return {
            availableBalance: totalBalance.toFixed(2),
            pendingSales: pendingSales.toFixed(2),
            partnerPayouts: "3120.00",
            gatewayStatus: "Verified"
        };
    }

    async getPayouts() {
        // In a real app, this would be a Payout entity
        return [
            { id: "PAY-9921", recipient: "Digital Solutions Inc.", amount: 1240.00, status: "paid", date: "2026-02-05", type: "Affiliate" },
            { id: "PAY-9920", recipient: "Alpha Agency", amount: 850.50, status: "pending", date: "2026-02-07", type: "Partner" },
            { id: "PAY-9919", recipient: "Cloud Services LLC", amount: 3200.00, status: "paid", date: "2026-01-28", type: "Referral" },
        ];
    }

    async processPayout(data: any) {
        console.log("Processing payout:", data);
        return { success: true, message: "Payout dispatched successfully" };
    }

    async getFinanceConfig() {
        return {
            sandboxMode: false,
            auditInterval: "realtime",
            baseCurrency: "usd"
        };
    }

    async updateFinanceConfig(config: any) {
        console.log("Updating config:", config);
        return { success: true, config };
    }

    // Helper method to seed initial data if none exists
    async seedInitialData(user: User): Promise<void> {
        const pmCount = await this.paymentMethodRepository.count({ where: { user: { id: user.id } } });
        if (pmCount === 0) {
            await this.addPaymentMethod(user, {
                brand: 'Visa',
                last4: '4242',
                expiry: '12/28',
                type: 'Digital Gold',
                isDefault: true,
            });
            await this.addPaymentMethod(user, {
                brand: 'Mastercard',
                last4: '8888',
                expiry: '10/27',
                type: 'Business Elite',
                isDefault: false,
            });
        }

        const tCount = await this.transactionRepository.count({ where: { user: { id: user.id } } });
        if (tCount === 0) {
            await this.transactionRepository.save([
                {
                    user,
                    invoiceId: 'L-2026-X1',
                    amount: '$1,240.00',
                    type: 'Service Settlement',
                    status: 'completed',
                    createdAt: new Date('2026-02-01'),
                    dueAt: new Date('2026-02-15'),
                },
                {
                    user,
                    invoiceId: 'L-2026-X0',
                    amount: '$49.00',
                    type: 'Pro Subscription',
                    status: 'completed',
                    createdAt: new Date('2026-01-15'),
                    dueAt: new Date('2026-01-30'),
                },
            ]);
        }
    }
}
