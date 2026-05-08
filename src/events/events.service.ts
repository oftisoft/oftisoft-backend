import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import {
  EventRegistration,
  RegistrationStatus,
} from '../entities/event-registration.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationRepository: Repository<EventRegistration>,
  ) {}

  // Event CRUD
  async create(eventData: Partial<Event>): Promise<Event> {
    const event = this.eventRepository.create(eventData);
    return this.eventRepository.save(event);
  }

  async findAll(options?: {
    status?: EventStatus;
    type?: string;
    upcoming?: boolean;
  }): Promise<Event[]> {
    const query = this.eventRepository.createQueryBuilder('event');

    if (options?.status) {
      query.andWhere('event.status = :status', { status: options.status });
    }

    if (options?.type) {
      query.andWhere('event.type = :type', { type: options.type });
    }

    if (options?.upcoming) {
      query.andWhere('event.startDate > :now', { now: new Date() });
    }

    query.orderBy('event.startDate', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { slug },
      relations: ['creator'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, eventData: Partial<Event>): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, eventData);
    return this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  async publish(id: string): Promise<Event> {
    const event = await this.findOne(id);
    event.status = EventStatus.PUBLISHED;
    return this.eventRepository.save(event);
  }

  // Registration methods
  async register(
    eventId: string,
    userId: string,
    customFields?: Record<string, string>,
  ): Promise<EventRegistration> {
    const event = await this.findOne(eventId);

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      throw new BadRequestException('Event is at full capacity');
    }

    // Check if already registered
    const existing = await this.registrationRepository.findOne({
      where: { eventId, userId },
    });
    if (existing) {
      throw new BadRequestException('Already registered for this event');
    }

    // Create registration
    const registration = this.registrationRepository.create({
      eventId,
      userId,
      customFields,
      status: event.requiresApproval
        ? RegistrationStatus.PENDING
        : RegistrationStatus.APPROVED,
      ticketNumber: this.generateTicketNumber(),
    });

    // Update count
    event.registeredCount += 1;
    await this.eventRepository.save(event);

    return this.registrationRepository.save(registration);
  }

  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    const registration = await this.registrationRepository.findOne({
      where: { eventId, userId },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    registration.status = RegistrationStatus.CANCELLED;
    await this.registrationRepository.save(registration);

    // Update count
    const event = await this.findOne(eventId);
    event.registeredCount = Math.max(0, event.registeredCount - 1);
    await this.eventRepository.save(event);
  }

  async getRegistrations(eventId: string): Promise<EventRegistration[]> {
    return this.registrationRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    return this.registrationRepository.find({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAttendance(
    registrationId: string,
    attended: boolean,
  ): Promise<EventRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { id: registrationId },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    registration.hasAttended = attended;
    if (attended) {
      registration.attendedAt = new Date();
    }
    registration.status = attended
      ? RegistrationStatus.ATTENDED
      : RegistrationStatus.NO_SHOW;

    return this.registrationRepository.save(registration);
  }

  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `EVT-${timestamp}-${random}`;
  }
}
