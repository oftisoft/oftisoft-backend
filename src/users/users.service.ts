import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { Ticket } from '../entities/ticket.entity';
import { SiteVisit } from '../entities/site-visit.entity';
import { Order } from '../entities/order.entity';
import { Review } from '../entities/review.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';
import { Favorite } from '../entities/favorite.entity';
import { DownloadRecord } from '../entities/download-record.entity';
import { Affiliate } from '../entities/affiliate.entity';
import { AffiliateCommission } from '../entities/affiliate-commission.entity';
import { AffiliateWithdrawal } from '../entities/affiliate-withdrawal.entity';
import { Project } from '../entities/project.entity';
import { Quote } from '../entities/quote.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(SiteVisit)
    private siteVisitRepository: Repository<SiteVisit>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(DownloadRecord)
    private downloadRecordRepository: Repository<DownloadRecord>,
    @InjectRepository(Affiliate)
    private affiliateRepository: Repository<Affiliate>,
    @InjectRepository(AffiliateCommission)
    private affiliateCommissionRepository: Repository<AffiliateCommission>,
    @InjectRepository(AffiliateWithdrawal)
    private affiliateWithdrawalRepository: Repository<AffiliateWithdrawal>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
  ) {}

  async getActivity(
    userId: string,
  ): Promise<{ page: string; timestamp: string; ip: string | null }[]> {
    const visits = await this.siteVisitRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: 10,
      select: ['page', 'timestamp', 'ip'],
    });
    return visits.map((v) => ({
      page: v.page,
      timestamp:
        v.timestamp instanceof Date
          ? v.timestamp.toISOString()
          : String(v.timestamp),
      ip: v.ip ?? null,
    }));
  }

  async getStats(userId: string) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId }, status: 'completed' },
    });

    const ticketCount = await this.ticketRepository.count({
      where: { customer: { id: userId } },
    });

    const ltv = transactions.reduce((sum, t) => {
      const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ''));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return {
      ltv: ltv.toFixed(2),
      orderCount: transactions.length,
      ticketCount,
    };
  }

  async create(userData: any): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = new User();
    user.name = userData.name;
    user.email = userData.email;
    user.role = userData.role || 'Viewer';
    user.phone = userData.phone || '';
    user.isActive = true;

    if (userData.password) {
      user.password = await bcrypt.hash(userData.password, 10);
    }

    const saved = await this.userRepository.save(user);
    const {
      password,
      twoFactorSecret,
      resetPasswordToken,
      resetPasswordExpires,
      googleId,
      githubId,
      ...safe
    } = saved;
    return safe as User;
  }

  async findAll(
    search?: string,
    role?: string,
    isActive?: boolean,
  ): Promise<User[]> {
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const list = await this.userRepository.find({
      where: search
        ? [
            { ...where, name: Like(`%${search}%`) },
            { ...where, email: Like(`%${search}%`) },
          ]
        : where,
      order: { createdAt: 'DESC' },
    });
    return list.map((u) => {
      const {
        password,
        twoFactorSecret,
        resetPasswordToken,
        resetPasswordExpires,
        googleId,
        githubId,
        ...safe
      } = u;
      return safe as User;
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const {
      password,
      twoFactorSecret,
      resetPasswordToken,
      resetPasswordExpires,
      googleId,
      githubId,
      ...safe
    } = user;
    return safe as User;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (updateData.password) {
      (existing as any).password = await bcrypt.hash(updateData.password, 10);
    }
    const { password: _p, ...rest } = updateData;
    Object.assign(existing, rest);
    const saved = await this.userRepository.save(existing);
    const {
      password,
      twoFactorSecret,
      resetPasswordToken,
      resetPasswordExpires,
      googleId,
      githubId,
      ...safe
    } = saved;
    return safe as User;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.remove(user);
  }

  async toggleStatus(id: string): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    existing.isActive = !existing.isActive;
    const saved = await this.userRepository.save(existing);
    const {
      password,
      twoFactorSecret,
      resetPasswordToken,
      resetPasswordExpires,
      googleId,
      githubId,
      ...safe
    } = saved;
    return safe as User;
  }

  async exportUserData(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        orders: { items: true },
        tickets: true,
        reviews: true,
        notifications: true,
        favorites: true,
        downloadRecords: true,
        projects: true,
        quotes: true,
        transactions: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const messages = await this.messageRepository.find({
      where: { sender: { id: userId } },
    });

    const affiliate = await this.affiliateRepository.findOne({
      where: { user: { id: userId } },
    });

    let affiliateCommissions: AffiliateCommission[] = [];
    let affiliateWithdrawals: AffiliateWithdrawal[] = [];
    if (affiliate) {
      affiliateCommissions = await this.affiliateCommissionRepository.find({
        where: { affiliate: { id: affiliate.id } },
      });
      affiliateWithdrawals = await this.affiliateWithdrawalRepository.find({
        where: { affiliate: { id: affiliate.id } },
      });
    }

    const {
      password,
      twoFactorSecret,
      resetPasswordToken,
      resetPasswordExpires,
      googleId,
      githubId,
      tokenVersion,
      ...safeUser
    } = user;

    return {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      profile: safeUser,
      orders: user.orders || [],
      supportTickets: user.tickets || [],
      reviews: user.reviews || [],
      messages,
      notifications: user.notifications || [],
      favorites: user.favorites || [],
      downloads: user.downloadRecords || [],
      projects: user.projects || [],
      quotes: user.quotes || [],
      transactions: user.transactions || [],
      affiliate: affiliate
        ? {
            ...affiliate,
            commissions: affiliateCommissions,
            withdrawals: affiliateWithdrawals,
          }
        : null,
    };
  }

  async requestAccountDeletion(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    user.name = 'Deleted User';
    user.email = `deleted-${randomSuffix}-${Date.now()}@anonymized.com`;
    user.phone = '';
    user.address = '';
    user.city = '';
    user.state = '';
    user.zipCode = '';
    user.unit = '';
    user.jobTitle = '';
    user.bio = '';
    user.avatarUrl = '';
    user.isActive = false;
    user.deletionRequestedAt = new Date();

    await this.userRepository.save(user);

    await this.notificationRepository.delete({ user: { id: userId } });
    await this.favoriteRepository.delete({ user: { id: userId } });

    return { message: 'Account deletion requested. Your data will be retained for 30 days before permanent removal.' };
  }

  async cancelDeletionRequest(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.deletionRequestedAt) {
      throw new BadRequestException('No deletion request found for this account');
    }

    const daysSinceRequest = Math.floor(
      (Date.now() - user.deletionRequestedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceRequest >= 30) {
      throw new BadRequestException(
        'The 30-day grace period has expired. Your data has been permanently anonymized.',
      );
    }

    user.deletionRequestedAt = null;
    user.isActive = true;
    user.name = 'Deleted User';
    user.email = `restored-${Math.random().toString(36).substring(2, 10)}-${Date.now()}@anonymized.com`;

    await this.userRepository.save(user);

    return { message: 'Deletion request cancelled. Please update your profile information.' };
  }
}
