import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { OrderItem } from '../entities/order-item.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: Record<string, jest.Mock>;

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product',
    price: 29.99,
    category: 'software',
    subcategory: 'tools',
    image: 'test.jpg',
    tags: ['tag1'],
    features: ['feat1'],
    version: '1.0',
    updatePolicy: 'lifetime',
    licenseRegular: 29.99,
    licenseExtended: 99.99,
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productsRepository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products ordered by createdAt DESC', async () => {
      const products = [mockProduct];
      productsRepository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(productsRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(products);
    });

    it('should filter by search term using Like', async () => {
      const products = [mockProduct];
      productsRepository.find.mockResolvedValue(products);

      const result = await service.findAll('test');

      expect(productsRepository.find).toHaveBeenCalledWith({
        where: { name: expect.objectContaining({ _value: '%test%' }) },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(products);
    });

    it('should filter by category when provided and not "all"', async () => {
      const products = [mockProduct];
      productsRepository.find.mockResolvedValue(products);

      const result = await service.findAll(undefined, 'software');

      expect(productsRepository.find).toHaveBeenCalledWith({
        where: { category: 'software' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      productsRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product is not found', async () => {
      productsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException with correct message', async () => {
      productsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        'Product not found',
      );
    });
  });
});
