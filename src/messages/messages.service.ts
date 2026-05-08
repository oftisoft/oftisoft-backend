import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { AIResponderService } from './ai-responder.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  SUPPORT = 'Support',
  EDITOR = 'Editor',
  USER = 'User',
  VIEWER = 'Viewer',
}

export interface RolePermissions {
  canMessageAllUsers: boolean;
  canMessageAdmins: boolean;
  canMessageSupport: boolean;
  canMessageStaff: boolean;
  canUploadFiles: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  canCreateGroup: boolean;
  canDeleteMessages: boolean;
  canEditMessages: boolean;
  canBlockUsers: boolean;
  canReportMessages: boolean;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPPORT]: 3,
  [UserRole.EDITOR]: 2,
  [UserRole.USER]: 1,
  [UserRole.VIEWER]: 0,
};

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepo: Repository<Message>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(BlockedUser)
    private blockedUsersRepo: Repository<BlockedUser>,
    private aiResponder: AIResponderService,
  ) {}

  getRolePermissions(role: UserRole): RolePermissions {
    const basePermissions: RolePermissions = {
      canMessageAllUsers: false,
      canMessageAdmins: false,
      canMessageSupport: true,
      canMessageStaff: false,
      canUploadFiles: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: [
        'image/*',
        'application/pdf',
        '.doc',
        '.docx',
        '.txt',
        '.zip',
      ],
      canCreateGroup: false,
      canDeleteMessages: false,
      canEditMessages: true,
      canBlockUsers: true,
      canReportMessages: true,
    };

    switch (role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return {
          ...basePermissions,
          canMessageAllUsers: true,
          canMessageAdmins: true,
          canMessageSupport: true,
          canMessageStaff: true,
          canCreateGroup: true,
          canDeleteMessages: true,
          canEditMessages: true,
          canBlockUsers: true,
          maxFileSize: 50 * 1024 * 1024,
        };
      case UserRole.SUPPORT:
        return {
          ...basePermissions,
          canMessageAllUsers: true,
          canMessageAdmins: true,
          canMessageSupport: true,
          canMessageStaff: true,
          canCreateGroup: true,
          canDeleteMessages: true,
          maxFileSize: 20 * 1024 * 1024,
        };
      case UserRole.EDITOR:
        return {
          ...basePermissions,
          canMessageStaff: true,
          canMessageSupport: true,
          maxFileSize: 15 * 1024 * 1024,
        };
      case UserRole.USER:
      case UserRole.VIEWER:
      default:
        return basePermissions;
    }
  }

  canMessageUser(
    senderRole: UserRole,
    recipientRole: UserRole,
    recipientIsSupport: boolean = false,
  ): boolean {
    if (senderRole === UserRole.SUPER_ADMIN) return true;

    if (senderRole === UserRole.ADMIN)
      return recipientRole !== UserRole.SUPER_ADMIN;

    if (senderRole === UserRole.SUPPORT) {
      return (
        recipientRole !== UserRole.SUPER_ADMIN &&
        recipientRole !== UserRole.ADMIN
      );
    }

    if (senderRole === UserRole.EDITOR) {
      return [
        UserRole.SUPPORT,
        UserRole.EDITOR,
        UserRole.USER,
        UserRole.VIEWER,
      ].includes(recipientRole);
    }

    if (senderRole === UserRole.USER || senderRole === UserRole.VIEWER) {
      if (recipientIsSupport) return true;
      return (
        recipientRole === UserRole.USER || recipientRole === UserRole.VIEWER
      );
    }

    return false;
  }

  async getUserConversations(userId: string) {
    try {
      const ids = await this.conversationsRepo
        .createQueryBuilder('c')
        .select('c.id')
        .innerJoin('c.participants', 'p')
        .where('p.id = :userId', { userId })
        .getRawMany()
        .then((rows) => rows.map((r: any) => r.c_id));

      const conversations =
        ids.length > 0
          ? await this.conversationsRepo.find({
              where: { id: In(ids) },
              relations: ['participants', 'messages', 'messages.sender'],
            })
          : [];

      // Get unread counts
      const unreadCounts = await this.messagesRepo
        .createQueryBuilder('m')
        .select('m.conversationId', 'conversationId')
        .addSelect('COUNT(*)', 'count')
        .where('m.read = false')
        .andWhere('m.senderId != :userId', { userId })
        .groupBy('m.conversationId')
        .getRawMany();

      const unreadMap = new Map(
        unreadCounts.map((u) => [u.conversationId, parseInt(u.count)]),
      );

      const result = conversations.map((c) => {
        const sortedMessages = (c.messages || []).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        return {
          ...c,
          lastMessage: sortedMessages[0] || null,
          messages: undefined,
          unreadCount: unreadMap.get(c.id) || 0,
          isPinned: c.isPinned || false,
          isMuted: c.isMuted || false,
          blockedBy: c.blockedBy || [],
        };
      });

      return result.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const timeB = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async getMessages(conversationId: string, userId: string) {
    // Check if user is participant
    const conversation = await this.conversationsRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.id === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    return this.messagesRepo.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
      relations: ['sender', 'replyTo', 'replyTo.sender', 'reactions'],
    });
  }

  async markConversationAsRead(conversationId: string, userId: string) {
    const result = await this.messagesRepo
      .createQueryBuilder()
      .update(Message)
      .set({ read: true, delivered: true })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .execute();
    return { updated: result.affected || 0 };
  }

  async sendMessage(
    senderId: string,
    conversationId: string,
    content: string,
    replyToId?: string,
    attachments?: any[],
  ) {
    const sender = await this.usersRepo.findOne({ where: { id: senderId } });
    const conversation = await this.conversationsRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    // Check if sender is participant
    const isParticipant = conversation.participants.some(
      (p) => p.id === senderId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    // Check permissions
    const senderRole = (sender?.role || 'User') as UserRole;
    const recipient = conversation.participants.find((p) => p.id !== senderId);

    if (recipient) {
      const canMessage = this.canMessageUser(
        senderRole,
        recipient.role as UserRole,
        recipient.isAI || recipient.role === 'Support',
      );

      if (!canMessage) {
        throw new ForbiddenException(
          'You do not have permission to message this user',
        );
      }
    }

    let replyToMessage: Message | null = null;
    if (replyToId) {
      replyToMessage = await this.messagesRepo.findOne({
        where: { id: replyToId },
        relations: ['sender'],
      });
    }

    const messageData: any = {
      sender: sender!,
      conversation,
      content,
      read: false,
      delivered: false,
      attachments: attachments || [],
    };

    if (replyToMessage) {
      messageData.replyTo = replyToMessage;
    }

    const message = this.messagesRepo.create(messageData);

    const savedMessage = await this.messagesRepo.save(message);

    // Check for AI bot
    const recipientBot = conversation.participants.find(
      (p) => p.isAI && p.id !== senderId,
    );
    if (recipientBot && savedMessage) {
      // Handle case where savedMessage might be array
      const messageToSend = Array.isArray(savedMessage)
        ? savedMessage[0]
        : savedMessage;
      if (messageToSend) {
        this.aiResponder.handleIncomingMessage(messageToSend);
      }
    }

    return savedMessage;
  }

  async editMessage(messageId: string, userId: string, content: string) {
    const message = await this.messagesRepo.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) throw new NotFoundException('Message not found');
    if (message.sender.id !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();

    return this.messagesRepo.save(message);
  }

  async deleteMessage(messageId: string, userId: string, userRole: string) {
    const message = await this.messagesRepo.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) throw new NotFoundException('Message not found');

    // Users can delete their own messages, admins/support can delete any
    const canDelete =
      message.sender.id === userId ||
      ['SuperAdmin', 'Admin', 'Support'].includes(userRole);

    if (!canDelete) {
      throw new ForbiddenException(
        'You do not have permission to delete this message',
      );
    }

    await this.messagesRepo.remove(message);
    return { success: true };
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await this.messagesRepo.findOne({
      where: { id: messageId },
      relations: ['reactions'],
    });

    if (!message) throw new NotFoundException('Message not found');

    // Initialize reactions if needed
    if (!message.reactions) {
      message.reactions = [];
    }

    const existingReaction = message.reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      if (!existingReaction.users.includes(userId)) {
        existingReaction.users.push(userId);
      }
    } else {
      message.reactions.push({ emoji, users: [userId] });
    }

    return this.messagesRepo.save(message);
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    const message = await this.messagesRepo.findOne({
      where: { id: messageId },
      relations: ['reactions'],
    });

    if (!message) throw new NotFoundException('Message not found');

    if (message.reactions) {
      const reaction = message.reactions.find((r) => r.emoji === emoji);
      if (reaction) {
        reaction.users = reaction.users.filter((id) => id !== userId);
        if (reaction.users.length === 0) {
          message.reactions = message.reactions.filter(
            (r) => r.emoji !== emoji,
          );
        }
      }
    }

    return this.messagesRepo.save(message);
  }

  async createConversation(creatorId: string, recipientId: string) {
    // Check if already blocked
    const isBlocked = await this.blockedUsersRepo.findOne({
      where: [
        { blockerId: creatorId, blockedId: recipientId },
        { blockerId: recipientId, blockedId: creatorId },
      ],
    });

    if (isBlocked) {
      throw new ForbiddenException('Cannot create conversation with this user');
    }

    // Check for existing conversation
    const existing = await this.conversationsRepo
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'p1')
      .innerJoin('conversation.participants', 'p2')
      .where('p1.id = :creatorId', { creatorId })
      .andWhere('p2.id = :recipientId', { recipientId })
      .andWhere('conversation.type = :type', { type: 'direct' })
      .getOne();

    if (existing) {
      return this.conversationsRepo.findOne({
        where: { id: existing.id },
        relations: ['participants'],
      });
    }

    const creator = await this.usersRepo.findOne({ where: { id: creatorId } });
    const recipient = await this.usersRepo.findOne({
      where: { id: recipientId },
    });

    if (!recipient) throw new NotFoundException('Recipient not found');

    // Check permissions
    const creatorRole = (creator?.role || 'User') as UserRole;
    const recipientRole = (recipient?.role || 'User') as UserRole;
    const canMessage = this.canMessageUser(
      creatorRole,
      recipientRole,
      recipient.isAI || recipient.role === 'Support',
    );

    if (!canMessage) {
      throw new ForbiddenException(
        'You do not have permission to message this user',
      );
    }

    const conversation = this.conversationsRepo.create({
      participants: [creator!, recipient],
      type: 'direct',
    });

    const saved = await this.conversationsRepo.save(conversation);

    return this.conversationsRepo.findOne({
      where: { id: saved.id },
      relations: ['participants'],
    });
  }

  async pinConversation(
    conversationId: string,
    userId: string,
    pinned: boolean,
  ) {
    const conversation = await this.conversationsRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = conversation.participants.some(
      (p) => p.id === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    conversation.isPinned = pinned;
    return this.conversationsRepo.save(conversation);
  }

  async muteConversation(
    conversationId: string,
    userId: string,
    muted: boolean,
  ) {
    const conversation = await this.conversationsRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = conversation.participants.some(
      (p) => p.id === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    conversation.isMuted = muted;
    return this.conversationsRepo.save(conversation);
  }

  async blockUser(blockerId: string, blockedId: string) {
    const existing = await this.blockedUsersRepo.findOne({
      where: { blockerId, blockedId },
    });

    if (existing) return existing;

    const blocked = this.blockedUsersRepo.create({
      blockerId,
      blockedId,
      blockedAt: new Date(),
    });

    return this.blockedUsersRepo.save(blocked);
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const blocked = await this.blockedUsersRepo.findOne({
      where: { blockerId, blockedId },
    });

    if (blocked) {
      await this.blockedUsersRepo.remove(blocked);
    }

    return { success: true };
  }

  async getSupportBot() {
    return this.aiResponder.getOrCreateAIBot();
  }

  async getAvailableUsersForMessaging(
    currentUserId: string,
    userRole?: string,
  ) {
    const isAdmin = userRole
      ? ['SuperAdmin', 'Admin'].includes(userRole)
      : false;
    const isSupport = userRole === 'Support';
    const isEditor = userRole === 'Editor';

    const qb = this.usersRepo
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .andWhere('user.isActive = :active', { active: true })
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.avatarUrl',
        'user.isAI',
      ]);

    // Check blocked users
    const blockedUsers = await this.blockedUsersRepo.find({
      where: [{ blockerId: currentUserId }, { blockedId: currentUserId }],
    });
    const blockedIds = blockedUsers.map((b) =>
      b.blockerId === currentUserId ? b.blockedId : b.blockerId,
    );

    if (blockedIds.length > 0) {
      qb.andWhere('user.id NOT IN (:...blockedIds)', { blockedIds });
    }

    if (isAdmin) {
      return qb.getMany();
    }

    const supportBot = await this.aiResponder.getOrCreateAIBot();

    let query = qb;

    if (isSupport) {
      query = query.andWhere(
        '(user.role NOT IN (:...adminRoles) OR user.isAI = :isAi)',
        {
          adminRoles: ['SuperAdmin', 'Admin'],
          isAi: true,
        },
      );
    } else if (isEditor) {
      query = query.andWhere('user.role IN (:...roles)', {
        roles: ['Support', 'Editor', 'User', 'Viewer'],
      });
    } else {
      // Regular users can only message Support and other users
      query = query.andWhere(
        '(user.role IN (:...roles) OR user.isAI = :isAi)',
        {
          roles: ['Support', 'User', 'Viewer'],
          isAi: true,
        },
      );
    }

    const users = await query.getMany();
    const byId = new Map(users.map((u) => [u.id, u]));

    if (!byId.has(supportBot.id)) {
      byId.set(supportBot.id, supportBot);
    }

    return Array.from(byId.values());
  }

  async searchMessages(conversationId: string, query: string) {
    return this.messagesRepo.find({
      where: {
        conversation: { id: conversationId },
        content: Like(`%${query}%`),
      },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
      take: 50,
    });
  }

  async uploadAttachment(file: Express.Multer.File): Promise<any> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'messages');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    return {
      id: fileId,
      name: file.originalname,
      url: `/uploads/messages/${filename}`,
      type: file.mimetype,
      size: file.size,
    };
  }
}
