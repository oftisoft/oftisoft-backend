import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { AIResponderService } from './ai-responder.service';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Conversation)
        private conversationsRepo: Repository<Conversation>,
        @InjectRepository(Message)
        private messagesRepo: Repository<Message>,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        private aiResponder: AIResponderService,
    ) { }

    async getUserConversations(userId: string) {
        try {
            // Fetch conversations where the user is a participant using simple find
            // This implicitly handles the ManyToMany join via the relations query
            const conversations = await this.conversationsRepo.find({
                where: {
                    participants: {
                        id: userId
                    }
                },
                relations: ['participants', 'messages', 'messages.sender'],
            });

            // Process and sort
            const result = conversations.map(c => {
                // Sort messages by creation date descending
                const sortedMessages = (c.messages || []).sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                return {
                    ...c,
                    lastMessage: sortedMessages[0] || null,
                    messages: undefined
                };
            });

            // Sort conversations by last message time
            return result.sort((a, b) => {
                const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
                const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
                return timeB - timeA;
            });
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return [];
        }
    }

    async getMessages(conversationId: string) {
        return this.messagesRepo.find({
            where: { conversation: { id: conversationId } },
            order: { createdAt: 'ASC' },
            relations: ['sender'],
        });
    }

    async sendMessage(senderId: string, conversationId: string, content: string) {
        const sender = await this.usersRepo.findOne({ where: { id: senderId } });
        const conversation = await this.conversationsRepo.findOne({
            where: { id: conversationId },
            relations: ['participants'],
        });

        if (!conversation) throw new NotFoundException('Conversation not found');

        const message = this.messagesRepo.create({
            sender: sender!,
            conversation,
            content,
            read: false,
        });

        const savedMessage = await this.messagesRepo.save(message);

        // Check if any participant is an AI (excluding the sender)
        const recipientBot = conversation.participants.find(p => p.isAI && p.id !== senderId);
        if (recipientBot) {
            // Trigger AI response (handled asynchronously within the service)
            this.aiResponder.handleIncomingMessage(savedMessage);
        }

        return savedMessage;
    }

    async createConversation(creatorId: string, recipientId: string) {
        // Check if a direct conversation already exists between these users
        const existing = await this.conversationsRepo
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'p1')
            .innerJoin('conversation.participants', 'p2')
            .where('p1.id = :creatorId', { creatorId })
            .andWhere('p2.id = :recipientId', { recipientId })
            .andWhere('conversation.type = :type', { type: 'direct' })
            .getOne();

        if (existing) {
            // Re-fetch with relations to be consistent
            return this.conversationsRepo.findOne({
                where: { id: existing.id },
                relations: ['participants']
            });
        }

        const creator = await this.usersRepo.findOne({ where: { id: creatorId } });
        const recipient = await this.usersRepo.findOne({ where: { id: recipientId } });

        if (!recipient) throw new NotFoundException('Recipient not found');

        const conversation = this.conversationsRepo.create({
            participants: [creator!, recipient!],
            type: 'direct',
        });

        const saved = await this.conversationsRepo.save(conversation);

        // Re-fetch to get relations
        return this.conversationsRepo.findOne({
            where: { id: saved.id },
            relations: ['participants']
        });
    }

    async getSupportBot() {
        return this.aiResponder.getOrCreateAIBot();
    }
}
