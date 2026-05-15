import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CacheService } from '../cache/cache.service';
import { SiteVisit } from '../entities/site-visit.entity';
import { SiteEvent } from '../entities/site-event.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import PDFDocument from 'pdfkit';

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
    private cacheService: CacheService,
  ) {}

  async recordVisit(data: {
    page: string;
    ip?: string;
    userAgent?: string;
    referrer?: string;
    userId?: string;
  }) {
    const visit = this.visitRepository.create(data);
    const result = this.visitRepository.save(visit);
    await this.cacheService.invalidatePattern('analytics:stats:*');
    return result;
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
    const result = this.eventRepository.save(event);
    await this.cacheService.invalidatePattern('analytics:stats:*');
    return result;
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
    const cacheKey = `analytics:stats:${timeRange}`;
    return this.cacheService.getOrFetch(cacheKey, async () => {
      const { from } = this.getDateRange(timeRange);
      const totalVisits = await this.visitRepository.count();
      const totalUsers = await this.userRepository.count();
      const orders = await this.orderRepository.find({ relations: ['items'] });
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, o) => sum + Number(o.total || 0),
        0,
      );

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

      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentVisits = await this.visitRepository.find({
        where: { timestamp: MoreThan(fiveMinAgo) },
        order: { timestamp: 'DESC' },
        take: 20,
      });
      const activeNow = recentVisits.length;

      const completedOrders = orders.filter((o) => o.status === 'completed');
      const completedRevenue = completedOrders.reduce(
        (s, o) => s + Number(o.total || 0),
        0,
      );
      const pendingRevenue = orders
        .filter((o) => ['pending', 'processing'].includes(o.status))
        .reduce((s, o) => s + Number(o.total || 0), 0);

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
    }, 300);
  }

  async exportStatsPdf(timeRange: TimeRange = 'week'): Promise<Buffer> {
    const stats = await this.getStats(timeRange);
    const { from } = this.getDateRange(timeRange);

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(22).font('Helvetica-Bold').text('Oftisoft Analytics Report', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica').fillColor('#555555')
        .text(`Date Range: ${from.toLocaleDateString()} — ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.fillColor('#000000');
      doc.moveDown(1);

      doc.fontSize(15).font('Helvetica-Bold').text('Overview');
      doc.moveDown(0.4);
      const overviewItems = [
        ['Revenue', `$${stats.overview.revenue}`],
        ['Orders', String(stats.overview.orders)],
        ['Customers', String(stats.overview.customers)],
        ['Conversion Rate', stats.overview.conversion],
        ['Order Growth', stats.overview.growthOrders],
        ['Revenue Growth', stats.overview.growthRevenue],
      ];
      doc.fontSize(10).font('Helvetica');
      overviewItems.forEach(([label, value]) => {
        doc.text(`${label}:  ${value}`, { indent: 20 });
      });
      doc.moveDown(1);

      doc.fontSize(15).font('Helvetica-Bold').text('Performance');
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Completion Rate:  ${stats.performance.completionRate}`, { indent: 20 });
      doc.text(`Total Tasks:  ${stats.totalTasks}`, { indent: 20 });
      doc.text(`Team Velocity:  ${stats.performance.teamVelocity}`, { indent: 20 });
      doc.moveDown(1);

      doc.fontSize(15).font('Helvetica-Bold').text('Product Performance');
      doc.moveDown(0.4);
      const drawTable = (
        headers: string[],
        rows: string[][],
        colWidths: number[],
      ) => {
        const startX = 50;
        const startY = doc.y;
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
        let x = startX;
        doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), 16).fill('#334155');
        headers.forEach((h, i) => {
          doc.text(h, x + 4, startY + 4, { width: colWidths[i], align: i === 0 ? 'left' as const : 'right' as const });
          x += colWidths[i];
        });
        doc.fillColor('#000000');
        let y = startY + 18;
        doc.font('Helvetica').fontSize(9);
        rows.forEach((row, ri) => {
          if (ri % 2 === 1) {
            doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 14).fill('#f1f5f9');
            doc.fillColor('#000000');
          }
          x = startX;
          row.forEach((cell, ci) => {
            doc.text(cell, x + 4, y + 3, { width: colWidths[ci], align: ci === 0 ? 'left' as const : 'right' as const });
            x += colWidths[ci];
          });
          y += 14;
        });
        doc.y = y + 10;
      };
      const prodHeaders = ['Product', 'Sales', 'Revenue'];
      const prodRows = stats.productPerformance.map(
        (p) => [p.name, String(p.sales), `$${p.revenue}`],
      );
      drawTable(prodHeaders, prodRows, [250, 80, 100]);
      doc.moveDown(0.5);

      doc.fontSize(15).font('Helvetica-Bold').text('Customer Demographics');
      doc.moveDown(0.4);
      const demoHeaders = ['Country', 'Share'];
      const demoRows = stats.customerDemographics.map(
        (d) => [d.name, `${d.value}%`],
      );
      drawTable(demoHeaders, demoRows, [350, 80]);

      doc.end();
    });
  }
}
