import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { Ticket } from '../entities/ticket.entity';
import { SiteVisit } from '../entities/site-visit.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Transaction, Ticket, SiteVisit])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
