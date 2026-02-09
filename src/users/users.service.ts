import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
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
    ) { }

    async getActivity(userId: string) {
        return this.siteVisitRepository.find({
            where: { userId },
            order: { timestamp: 'DESC' },
            take: 10
        });
    }

    async getStats(userId: string) {
        const transactions = await this.transactionRepository.find({
            where: { user: { id: userId }, status: 'completed' }
        });

        const ticketCount = await this.ticketRepository.count({
            where: { customer: { id: userId } }
        });

        const ltv = transactions.reduce((sum, t) => {
            const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ""));
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        return {
            ltv: ltv.toFixed(2),
            orderCount: transactions.length,
            ticketCount
        };
    }

    async create(userData: any): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email: userData.email } });
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

        return this.userRepository.save(user);
    }

    async findAll(search?: string, role?: string, isActive?: boolean): Promise<User[]> {
        const where: any = {};

        if (role) {
            where.role = role;
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        return this.userRepository.find({
            where: search ? [
                { ...where, name: Like(`%${search}%`) },
                { ...where, email: Like(`%${search}%`) }
            ] : where,
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        const user = await this.findOne(id);

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        Object.assign(user, updateData);
        return this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }

    async toggleStatus(id: string): Promise<User> {
        const user = await this.findOne(id);
        user.isActive = !user.isActive;
        return this.userRepository.save(user);
    }
}
