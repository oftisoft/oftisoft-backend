import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheService } from '../cache/cache.service';
import { AnalyticsService } from './analytics.service';
import { SiteVisit } from '../entities/site-visit.entity';
import { SiteEvent } from '../entities/site-event.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let visitRepository: Record<string, jest.Mock>;
  let eventRepository: Record<string, jest.Mock>;
  let cacheService: Record<string, jest.Mock>;

  const mockVisitData = {
    page: '/home',
    ip: '127.0.0.1',
    userAgent: 'test-agent',
    referrer: 'https://google.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(SiteVisit),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SiteEvent),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Project),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            getOrFetch: jest.fn(),
            invalidatePattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    visitRepository = module.get(getRepositoryToken(SiteVisit));
    eventRepository = module.get(getRepositoryToken(SiteEvent));
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordVisit', () => {
    it('should create and save a SiteVisit and invalidate cache', async () => {
      const createdVisit = { id: '1', ...mockVisitData, timestamp: new Date() };
      visitRepository.create.mockReturnValue(createdVisit);
      visitRepository.save.mockResolvedValue(createdVisit);

      const result = await service.recordVisit(mockVisitData);

      expect(visitRepository.create).toHaveBeenCalledWith(mockVisitData);
      expect(visitRepository.save).toHaveBeenCalledWith(createdVisit);
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith(
        'analytics:stats:*',
      );
      expect(result).toEqual(createdVisit);
    });

    it('should handle visit data with userId', async () => {
      const visitWithUser = {
        page: '/dashboard',
        userId: 'user-1',
        ip: '192.168.1.1',
      };
      const createdVisit = { id: '2', ...visitWithUser, timestamp: new Date() };
      visitRepository.create.mockReturnValue(createdVisit);
      visitRepository.save.mockResolvedValue(createdVisit);

      const result = await service.recordVisit(visitWithUser);

      expect(visitRepository.create).toHaveBeenCalledWith(visitWithUser);
      expect(visitRepository.save).toHaveBeenCalledWith(createdVisit);
      expect(result.userId).toBe('user-1');
    });
  });

  describe('recordEvent', () => {
    it('should create and save a SiteEvent with stringified metadata', async () => {
      const eventData = {
        eventType: 'click',
        eventLabel: 'Buy Now',
        page: '/pricing',
        metadata: { buttonId: 'btn-1' },
      };
      const createdEvent = {
        id: '1',
        ...eventData,
        metadata: JSON.stringify(eventData.metadata),
        timestamp: new Date(),
      };
      eventRepository.create.mockReturnValue(createdEvent);
      eventRepository.save.mockResolvedValue(createdEvent);

      const result = await service.recordEvent(eventData);

      expect(eventRepository.create).toHaveBeenCalledWith({
        eventType: 'click',
        eventLabel: 'Buy Now',
        page: '/pricing',
        metadata: JSON.stringify({ buttonId: 'btn-1' }),
      });
      expect(eventRepository.save).toHaveBeenCalledWith(createdEvent);
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith(
        'analytics:stats:*',
      );
      expect(result).toEqual(createdEvent);
    });
  });
});
