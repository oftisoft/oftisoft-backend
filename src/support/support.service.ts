import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from '../entities/ticket.entity';
import { TicketMessage } from '../entities/ticket-message.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SupportService {
    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        @InjectRepository(TicketMessage)
        private messageRepository: Repository<TicketMessage>,
    ) { }

    async createTicket(subject: string, category: string, priority: TicketPriority, description: string, user: User) {
        const ticket = this.ticketRepository.create({
            subject,
            category,
            priority,
            customer: user,
            status: TicketStatus.OPEN,
        });

        const savedTicket = await this.ticketRepository.save(ticket);

        // Create initial message
        const message = this.messageRepository.create({
            content: description,
            ticket: savedTicket,
            sender: user,
        });
        await this.messageRepository.save(message);

        return savedTicket;
    }

    async findAll(user: User, status?: TicketStatus) {
        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.customer', 'customer')
            .leftJoinAndSelect('ticket.messages', 'messages')
            .orderBy('ticket.updatedAt', 'DESC');

        if (user.role !== 'admin') {
            query.where('customer.id = :userId', { userId: user.id });
        }

        if (status) {
            query.andWhere('ticket.status = :status', { status });
        }

        return query.getMany();
    }

    async findOne(id: string) {
        const ticket = await this.ticketRepository.findOne({
            where: { id },
            relations: ['customer', 'messages', 'messages.sender'],
        });

        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${id} not found`);
        }

        return ticket;
    }

    async addMessage(ticketId: string, content: string, sender: User) {
        const ticket = await this.findOne(ticketId);

        const message = this.messageRepository.create({
            content,
            ticket,
            sender,
        });

        await this.messageRepository.save(message);

        // Update ticket updatedAt timestamp
        ticket.updatedAt = new Date();
        await this.ticketRepository.save(ticket);

        return message;
    }

    async updateStatus(id: string, status: TicketStatus) {
        const ticket = await this.findOne(id);
        ticket.status = status;
        return this.ticketRepository.save(ticket);
    }

    async getStats() {
        const activeTickets = await this.ticketRepository.count({
            where: { status: TicketStatus.OPEN }
        });

        const urgentCount = await this.ticketRepository.count({
            where: { priority: TicketPriority.URGENT, status: TicketStatus.OPEN }
        });

        // In a real app, these would be calculated differently
        return {
            activeTickets,
            urgentCount,
            avgResponse: '42m',
            liveChats: 3,
            csatScore: 4.88
        };
    }
}
