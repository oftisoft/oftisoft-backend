
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private repo: Repository<Notification>,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
    ) { }

    async getUserNotifications(userId: string) {
        return this.repo.find({
            where: { user: { id: userId }, archived: false },
            order: { createdAt: 'DESC' },
        });
    }

    async getArchivedNotifications(userId: string) {
        return this.repo.find({
            where: { user: { id: userId }, archived: true },
            order: { createdAt: 'DESC' }
        });
    }

    async markAsRead(userId: string, notificationId: string) {
        const notif = await this.repo.findOne({ where: { id: notificationId, user: { id: userId } } });
        if (!notif) throw new NotFoundException('Notification not found');
        notif.read = true;
        return this.repo.save(notif);
    }

    async markAllAsRead(userId: string) {
        await this.repo.update({ user: { id: userId }, read: false }, { read: true });
        return { success: true };
    }

    async archive(userId: string, notificationId: string) {
        const notif = await this.repo.findOne({ where: { id: notificationId, user: { id: userId } } });
        if (!notif) throw new NotFoundException('Notification not found');
        notif.archived = true;
        return this.repo.save(notif);
    }

    async delete(userId: string, notificationId: string) {
        const notif = await this.repo.findOne({ where: { id: notificationId, user: { id: userId } } });
        if (!notif) throw new NotFoundException('Notification not found');
        return this.repo.remove(notif);
    }

    async create(userId: string, dto: Partial<Notification>) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        const notif = this.repo.create({ ...dto, user });
        return this.repo.save(notif);
    }
}
