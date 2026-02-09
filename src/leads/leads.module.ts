import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadController } from './leads.controller';
import { LeadService } from './leads.service';
import { Lead } from '../entities/lead.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Lead])],
    controllers: [LeadController],
    providers: [LeadService],
    exports: [LeadService]
})
export class LeadModule { }
