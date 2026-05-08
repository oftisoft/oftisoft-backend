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
}
