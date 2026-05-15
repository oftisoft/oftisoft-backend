import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { FcmService } from './fcm.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private fcmService: FcmService,
  ) {}

  async getUserNotifications(userId: string) {
    const list = await this.repo.find({
      where: { user: { id: userId }, archived: false },
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'type',
        'title',
        'description',
        'read',
        'archived',
        'priority',
        'link',
        'createdAt',
      ],
    });
    return list;
  }

  async getArchivedNotifications(userId: string) {
    const list = await this.repo.find({
      where: { user: { id: userId }, archived: true },
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'type',
        'title',
        'description',
        'read',
        'archived',
        'priority',
        'link',
        'createdAt',
      ],
    });
    return list;
  }

  async getCounts(userId: string) {
    const [unread, highPriority, archived] = await Promise.all([
      this.repo.count({
        where: { user: { id: userId }, archived: false, read: false },
      }),
      this.repo.count({
        where: { user: { id: userId }, archived: false, priority: 'high' },
      }),
      this.repo.count({ where: { user: { id: userId }, archived: true } }),
    ]);
    return { unread, highPriority, archived };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notif = await this.repo.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.read = true;
    return this.repo.save(notif);
  }

  async markAllAsRead(userId: string) {
    await this.repo
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('userId = :userId', { userId })
      .andWhere('read = :read', { read: false })
      .execute();
    return { success: true };
  }

  async archive(userId: string, notificationId: string) {
    const notif = await this.repo.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.archived = true;
    return this.repo.save(notif);
  }

  async unarchive(userId: string, notificationId: string) {
    const notif = await this.repo.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.archived = false;
    return this.repo.save(notif);
  }

  async delete(userId: string, notificationId: string) {
    const notif = await this.repo.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    return this.repo.remove(notif);
  }

  async create(userId: string, dto: Partial<Notification>) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const notif = this.repo.create({ ...dto, user });
    const saved = await this.repo.save(notif);
    if (user.pushNotifications && dto.title) {
      this.fcmService
        .sendToUser(userId, dto.title, dto.description || dto.title)
        .catch(() => {});
    }
    return saved;
  }

  async sendPush(userId: string, title: string, body: string) {
    return this.create(userId, {
      type: 'alert',
      title,
      description: body,
    });
  }
}
