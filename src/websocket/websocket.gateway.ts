import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@Injectable()
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSocketMap: Map<string, string> = new Map();

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove user from socket map
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthentication(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;

    // Store user-socket mapping
    this.userSocketMap.set(userId, client.id);

    // Join user's personal room for notifications
    client.join(`user:${userId}`);

    console.log(`User ${userId} authenticated on socket ${client.id}`);

    // Send unread notification count
    const unreadCount = await this.notificationRepository.count({
      where: { user: { id: userId }, read: false },
    });

    client.emit('unreadCount', { notifications: unreadCount });
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId, userId } = data;

    // Verify user is part of the conversation
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (
      conversation &&
      conversation.participants.some((p) => p.id === userId)
    ) {
      client.join(`conversation:${conversationId}`);
      client.emit('joinedConversation', { conversationId });

      // Mark messages as read
      await this.messageRepository.update(
        {
          conversation: { id: conversationId },
          sender: { id: userId },
          read: false,
        },
        { read: true },
      );
    } else {
      client.emit('error', {
        message: 'Not authorized to join this conversation',
      });
    }
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation:${data.conversationId}`);
    client.emit('leftConversation', { conversationId: data.conversationId });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId, senderId, content } = data;

    // Get conversation with participants
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      return client.emit('error', { message: 'Conversation not found' });
    }

    // Verify sender is a participant
    if (!conversation.participants.some((p) => p.id === senderId)) {
      return client.emit('error', {
        message: 'Not authorized to send messages in this conversation',
      });
    }

    // Get sender user
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      return client.emit('error', { message: 'Sender not found' });
    }

    // Create message
    const message = this.messageRepository.create({
      content,
      read: false,
      sender: sender,
      conversation: conversation,
    });

    await this.messageRepository.save(message);

    // Broadcast to conversation room
    this.server.to(`conversation:${conversationId}`).emit('newMessage', {
      id: message.id,
      conversationId,
      senderId,
      content,
      createdAt: message.createdAt,
    });

    // Get receiver (other participant)
    const receiver = conversation.participants.find((p) => p.id !== senderId);

    if (receiver) {
      // Send notification to receiver if online
      const receiverSocketId = this.userSocketMap.get(receiver.id);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessageNotification', {
          conversationId,
          senderId,
          content:
            content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        });
      }

      // Create notification
      const notification = this.notificationRepository.create({
        type: 'message',
        title: 'New Message',
        description: `${sender?.name || 'Someone'} sent you a message`,
        user: receiver,
      });

      await this.notificationRepository.save(notification);

      // Send notification to receiver's room
      this.server.to(`user:${receiver.id}`).emit('notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        description: notification.description,
        createdAt: notification.createdAt,
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    data: { conversationId: string; userId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast typing status to conversation (except sender)
    client.to(`conversation:${data.conversationId}`).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('markNotificationsRead')
  async handleMarkNotificationsRead(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.notificationRepository.update(
      { user: { id: data.userId }, read: false },
      { read: true },
    );

    client.emit('notificationsMarkedRead');
  }

  // Public method to send notification from other services
  async sendNotification(
    userId: string,
    notificationData: Partial<Notification>,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) return;

    const createdNotification = this.notificationRepository.create({
      ...notificationData,
      user,
    });

    await this.notificationRepository.save(createdNotification);

    // Send to user's room
    this.server.to(`user:${userId}`).emit('notification', {
      id: createdNotification.id,
      type: createdNotification.type,
      title: createdNotification.title,
      description: createdNotification.description,
      createdAt: createdNotification.createdAt,
    });

    return createdNotification;
  }

  // Public method to broadcast to all connected clients
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Public method to send to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
