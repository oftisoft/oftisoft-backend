
import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, Res } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(req.user.userId, createOrderDto);
    }

    @Get()
    findAll(@Req() req) {
        return this.ordersService.findAll(req.user.userId);
    }

    @Get('export')
    async exportReport(@Req() req, @Res() res: Response) {
        const csv = await this.ordersService.generateReport(req.user.userId);
        res.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="orders_report.csv"',
        });
        res.send(csv);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req) {
        return this.ordersService.findOne(req.user.userId, id);
    }

    @Get(':id/invoice')
    async downloadInvoice(@Param('id') id: string, @Req() req, @Res() res: Response) {
        const buffer = await this.ordersService.generateInvoice(req.user.userId, id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice_${id}.pdf"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req) {
        return this.ordersService.updateStatus(req.user.userId, id, status);
    }
}
