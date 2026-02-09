import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
    constructor(private readonly quotesService: QuotesService) { }

    @Post()
    create(@Req() req, @Body() createQuoteDto: CreateQuoteDto) {
        return this.quotesService.create(req.user.userId, createQuoteDto);
    }

    @Get()
    findAll(@Req() req) {
        return this.quotesService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Req() req, @Param('id') id: string) {
        return this.quotesService.findOne(req.user.userId, id);
    }

    @Patch(':id')
    update(@Req() req, @Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
        return this.quotesService.update(req.user.userId, id, updateQuoteDto);
    }

    @Patch(':id/status')
    updateStatus(@Req() req, @Param('id') id: string, @Body('status') status: string) {
        return this.quotesService.updateStatus(req.user.userId, id, status);
    }

    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
        return this.quotesService.delete(req.user.userId, id);
    }

    @Get(':id/download')
    async downloadProposal(@Req() req, @Param('id') id: string, @Res() res: Response) {
        const buffer = await this.quotesService.downloadProposal(req.user.userId, id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="proposal_${id}.pdf"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
