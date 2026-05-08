import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SiteVisit } from '../entities/site-visit.entity';
import { SiteEvent } from '../entities/site-event.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';

type TimeRange = 'day' | 'week' | 'month';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SiteVisit)
    private visitRepository: Repository<SiteVisit>,
    @InjectRepository(SiteEvent)
    private eventRepository: Repository<SiteEvent>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async recordVisit(data: {
    page: string;
    ip?: string;
    userAgent?: string;
    referrer?: string;
    userId?: string;
  }) {
    const visit = this.visitRepository.create(data);
    return this.visitRepository.save(visit);
  }

  async recordEvent(data: {
    eventType: string;
    eventLabel?: string;
    page?: string;
    metadata?: any;
  }) {
    const event = this.eventRepository.create({
      eventType: data.eventType,
      eventLabel: data.eventLabel,
      page: data.page,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    });
    return this.eventRepository.save(event);
  }

  private getDateRange(timeRange: TimeRange): { from: Date } {
    const now = new Date();
    const from = new Date(now);
    if (timeRange === 'day') from.setDate(from.getDate() - 1);
    else if (timeRange === 'week') from.setDate(from.getDate() - 7);
    else from.setMonth(from.getMonth() - 1);
    return { from };
  }

  private getWeekdayNames(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }

  async getStats(timeRange: TimeRange = 'week') {
    const { from } = this.getDateRange(timeRange);
    const totalVisits = await this.visitRepository.count();
    const totalUsers = await this.userRepository.count();
    const orders = await this.orderRepository.find({ relations: ['items'] });
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.total || 0),
      0,
    );

    // Productivity: projects by status & completion over time
    const projects = await this.projectRepository.find({
      order: { updatedAt: 'DESC' },
    });
    const projectsByDay = this.getWeekdayNames().map((name) => ({
      name,
      completed: 0,
      active: 0,
      velocity: 0,
    }));
    const dayIndex = (d: Date) => d.getDay();
    projects.forEach((p) => {
      const idx = dayIndex(new Date(p.updatedAt));
      if (p.status === 'Completed') projectsByDay[idx].completed++;
      else projectsByDay[idx].active++;
    });
    projectsByDay.forEach((d) => {
      d.velocity = d.completed + Math.floor(d.active * 0.4);
    });

    // Task distribution: projects by status
    const statusCounts: Record<string, number> = {};
    projects.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    const totalProj = projects.length || 1;
    const taskDistribution = Object.entries(statusCounts).map(
      ([name, value], idx) => ({
        name,
        value: Math.round((value / totalProj) * 100),
        color:
          ['#ec4899', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][
            idx % 6
          ] || '#6366f1',
      }),
    );
    if (taskDistribution.length === 0) {
      taskDistribution.push({ name: 'No Data', value: 100, color: '#64748b' });
    }

    // Product performance: from order items
    const items = await this.orderItemRepository.find();
    const productMap = new Map<string, { sales: number; revenue: number }>();
    items.forEach((item) => {
      const key = item.productName || item.productId || 'Unknown';
      const rev = Number(item.price || 0) * (item.quantity || 1);
      const cur = productMap.get(key) || { sales: 0, revenue: 0 };
      productMap.set(key, {
        sales: cur.sales + (item.quantity || 1),
        revenue: cur.revenue + rev,
      });
    });
    const productPerformance: {
      name: string;
      sales: number;
      revenue: number;
    }[] = Array.from(productMap.entries())
      .map(([name, v]) => ({
        name,
        sales: v.sales,
        revenue: Math.round(v.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    if (productPerformance.length === 0) {
      productPerformance.push({
        name: 'No products sold yet',
        sales: 0,
        revenue: 0,
      });
    }

    // Customer demographics: from orders shipping address
    const countryMap = new Map<string, number>();
    orders.forEach((o) => {
      const addr = o.shippingAddress as { country?: string } | null;
      const c = addr?.country || 'Unknown';
      countryMap.set(c, (countryMap.get(c) || 0) + 1);
    });
    const totalWithCountry = orders.length || 1;
    const customerDemographics = Array.from(countryMap.entries())
      .map(([name, count]) => ({
        name,
        value: Math.round((count / totalWithCountry) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    if (customerDemographics.length === 0) {
      customerDemographics.push({ name: 'No data yet', value: 100 });
    }

    // Acquisition: from site events referrer / visits
    const visits = await this.visitRepository.find({
      where: { timestamp: MoreThan(from) },
      take: 500,
    });
    const refMap = new Map<string, number>();
    visits.forEach((v) => {
      const r = v.referrer || 'Direct';
      const key = r.includes('google')
        ? 'Search'
        : r === '' || !r
          ? 'Direct'
          : r.includes('facebook') || r.includes('twitter')
            ? 'Social'
            : 'Referral';
      refMap.set(key, (refMap.get(key) || 0) + 1);
    });
    const totalRef = visits.length || 1;
    const acquisition = [
      {
        name: 'Direct Traffic',
        value: Math.round(((refMap.get('Direct') || 0) / totalRef) * 100),
        color: 'bg-primary',
      },
      {
        name: 'Search Engines',
        value: Math.round(((refMap.get('Search') || 0) / totalRef) * 100),
        color: 'bg-blue-500',
      },
      {
        name: 'Social Referrals',
        value: Math.round(((refMap.get('Social') || 0) / totalRef) * 100),
        color: 'bg-pink-500',
      },
      {
        name: 'Backlinks',
        value: Math.round(((refMap.get('Referral') || 0) / totalRef) * 100),
        color: 'bg-orange-500',
      },
    ].filter((a) => a.value > 0);
    if (acquisition.length === 0) {
      acquisition.push({
        name: 'Direct Traffic',
        value: 100,
        color: 'bg-primary',
      });
    }

    // Live tracking: real visits in last 5 min
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentVisits = await this.visitRepository.find({
      where: { timestamp: MoreThan(fiveMinAgo) },
      order: { timestamp: 'DESC' },
      take: 20,
    });
    const activeNow = recentVisits.length;

    // Financial summary from orders
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const completedRevenue = completedOrders.reduce(
      (s, o) => s + Number(o.total || 0),
      0,
    );
    const pendingRevenue = orders
      .filter((o) => ['pending', 'processing'].includes(o.status))
      .reduce((s, o) => s + Number(o.total || 0), 0);

    // Overview trends: compare current period vs previous period
    const periodLength = new Date().getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - periodLength);
    const recentCount = await this.orderRepository
      .createQueryBuilder('o')
      .where('o.createdAt >= :from', { from })
      .getCount();
    const prevCount = await this.orderRepository
      .createQueryBuilder('o')
      .where('o.createdAt >= :prevFrom', { prevFrom })
      .andWhere('o.createdAt < :from', { from })
      .getCount();
    const growthOrders =
      prevCount > 0
        ? (((recentCount - prevCount) / prevCount) * 100).toFixed(1)
        : recentCount > 0
          ? '100'
          : '0';
    const currentPeriodRevenue = await this.orderRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'sum')
      .where('o.createdAt >= :from', { from })
      .getRawOne<{ sum: string | null }>();
    const prevPeriodRevenue = await this.orderRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'sum')
      .where('o.createdAt >= :prevFrom', { prevFrom })
      .andWhere('o.createdAt < :from', { from })
      .getRawOne<{ sum: string | null }>();
    const currRev = Number(currentPeriodRevenue?.sum || 0);
    const prevRev = Number(prevPeriodRevenue?.sum || 0);
    const growthRevenue =
      prevRev > 0
        ? (((currRev - prevRev) / prevRev) * 100).toFixed(1) + '%'
        : currRev > 0
          ? '+100%'
          : '0%';

    return {
      overview: {
        revenue: Math.round(totalRevenue * 100) / 100,
        orders: totalOrders,
        customers: totalUsers,
        conversion:
          totalVisits > 0
            ? ((totalOrders / totalVisits) * 100).toFixed(2) + '%'
            : '0%',
        growthOrders: String(growthOrders) + '%',
        growthRevenue,
      },
      productivity: projectsByDay,
      taskDistribution,
      totalTasks: projects.length,
      productPerformance,
      customerDemographics,
      acquisition,
      liveTracking: {
        activeNow,
        recentVisits: recentVisits.map((v) => ({
          ip: v.ip,
          page: v.page,
          userAgent: v.userAgent,
          timestamp: v.timestamp,
        })),
      },
      financial: {
        operatingProfit: Math.round(completedRevenue * 100) / 100,
        fiscalReserves: Math.round(pendingRevenue * 100) / 100,
        marketingSpend: 0,
      },
      performance: {
        completionRate:
          projects.length > 0
            ? (
                (projects.filter((p) => p.status === 'Completed').length /
                  projects.length) *
                100
              ).toFixed(0) + '%'
            : '0%',
        avgTurnaround: '—',
        criticalBugs: 0,
        teamVelocity: projects.filter((p) => p.status === 'Completed').length,
      },
    };
  }
}
