import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { Bundle } from '../entities/bundle.entity';
import { Product } from '../entities/product.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(Bundle)
    private bundleRepository: Repository<Bundle>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepo: Repository<SubscriptionPlan>,
  ) {}

  async getCoupons() {
    return this.couponRepository.find({ order: { createdAt: 'DESC' } });
  }

  async createCoupon(data: Partial<Coupon>) {
    const payload = { ...data };
    if (payload.expiryDate != null && typeof payload.expiryDate === 'string') {
      payload.expiryDate = new Date(payload.expiryDate) as any;
    }
    const coupon = this.couponRepository.create(payload);
    return this.couponRepository.save(coupon);
  }

  async deleteCoupon(id: string) {
    return this.couponRepository.delete(id);
  }

  async updateCoupon(id: string, data: Partial<Coupon>) {
    const payload = { ...data };
    if (payload.expiryDate != null && typeof payload.expiryDate === 'string') {
      payload.expiryDate = new Date(payload.expiryDate) as any;
    }
    await this.couponRepository.update(id, payload);
    return this.couponRepository.findOne({ where: { id } });
  }

  async getBundles() {
    return this.bundleRepository.find({
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  async createBundle(data: any) {
    const productIds = data.productIds || [];
    const products = await this.productRepository.findBy({
      id: In(productIds),
    });

    const bundle = this.bundleRepository.create({
      ...data,
      products,
    });

    return this.bundleRepository.save(bundle);
  }

  async updateBundle(id: string, data: any) {
    const bundle = await this.bundleRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!bundle) throw new NotFoundException('Bundle not found');

    if (data.productIds) {
      const products = await this.productRepository.findBy({
        id: In(data.productIds),
      });
      bundle.products = products;
      delete data.productIds;
    }

    Object.assign(bundle, data);
    return this.bundleRepository.save(bundle);
  }

  async getProducts() {
    return this.productRepository.find();
  }

  async deleteBundle(id: string) {
    return this.bundleRepository.delete(id);
  }

  // Subscription Plans
  async getSubscriptionPlans() {
    return this.subscriptionPlanRepo.find({ order: { price: 'ASC' } });
  }

  async createSubscriptionPlan(data: Partial<SubscriptionPlan>) {
    const plan = this.subscriptionPlanRepo.create(data);
    return this.subscriptionPlanRepo.save(plan);
  }

  async updateSubscriptionPlan(id: string, data: Partial<SubscriptionPlan>) {
    await this.subscriptionPlanRepo.update(id, data);
    return this.subscriptionPlanRepo.findOne({ where: { id } });
  }

  async deleteSubscriptionPlan(id: string) {
    return this.subscriptionPlanRepo.delete(id);
  }
}
