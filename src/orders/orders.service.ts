import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../entities/user.entity';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const order = this.ordersRepository.create({
      ...createOrderDto,
      user,
    });

    return this.ordersRepository.save(order);
  }

  async findAll(userId: string): Promise<Order[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const where = user.role === 'Admin' ? {} : { user: { id: userId } };

    return this.ordersRepository.find({
      where,
      relations: ['items', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Order> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const where = user.role === 'Admin' ? { id } : { id, user: { id: userId } };

    const order = await this.ordersRepository.findOne({
      where,
      relations: ['items', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    userId: string,
    id: string,
    status: string,
  ): Promise<Order> {
    const order = await this.findOne(userId, id);
    order.status = status;
    return this.ordersRepository.save(order);
  }

  async updateOrder(
    userId: string,
    id: string,
    updates: { internalNotes?: string; trackingNumber?: string },
  ): Promise<Order> {
    const order = await this.findOne(userId, id);
    if (updates.internalNotes !== undefined)
      order.internalNotes = updates.internalNotes;
    if (updates.trackingNumber !== undefined)
      order.trackingNumber = updates.trackingNumber;
    return this.ordersRepository.save(order);
  }

  async generateInvoice(userId: string, id: string): Promise<Buffer> {
    const order = await this.findOne(userId, id);
    const doc = new PDFDocument({ margin: 50 });

    return new Promise((resolve) => {
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fontSize(20)
        .text(`Invoice #${order.id.slice(0, 8)}`, { align: 'right' });
      doc
        .fontSize(10)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, {
          align: 'right',
        });
      doc.moveDown();

      // Customer Info
      doc.fontSize(12).text('Billed To:', { underline: true });
      doc.fontSize(10).text(order.user.name);
      doc.text(order.user.email);
      if (order.shippingAddress) {
        doc.text(
          `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
        );
        doc.text(
          `${order.shippingAddress.country}, ${order.shippingAddress.zip}`,
        );
      }
      doc.moveDown();

      // Table Header
      doc.fontSize(10).text('Product', 50, 200);
      doc.text('Qty', 300, 200);
      doc.text('Price', 400, 200, { width: 90, align: 'right' });
      doc.moveTo(50, 215).lineTo(550, 215).stroke();

      // Items
      let y = 230;
      order.items.forEach((item) => {
        doc.text(item.productName, 50, y);
        doc.text(item.quantity.toString(), 300, y);
        doc.text(`$${Number(item.price).toFixed(2)}`, 400, y, {
          width: 90,
          align: 'right',
        });
        y += 20;
      });

      doc
        .moveTo(50, y + 10)
        .lineTo(550, y + 10)
        .stroke();

      // Total
      doc
        .fontSize(14)
        .text(`Total: $${Number(order.total).toFixed(2)}`, 400, y + 30, {
          width: 90,
          align: 'right',
        });

      doc.end();
    });
  }

  async generateReport(userId: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const where = user.role === 'Admin' ? {} : { user: { id: userId } };
    const orders = await this.ordersRepository.find({
      where,
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    const data = orders.map((order) => [
      order.id,
      new Date(order.createdAt).toISOString(),
      order.status,
      order.items.length,
      order.total,
      order.paymentMethod,
    ]);

    return new Promise((resolve, reject) => {
      stringify(
        data,
        {
          header: true,
          columns: [
            'Order ID',
            'Date',
            'Status',
            'Items Count',
            'Total Amount',
            'Payment Method',
          ],
        },
        (err, output) => {
          if (err) reject(err);
          else resolve(output);
        },
      );
    });
  }
}
