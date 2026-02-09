import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Body() userData: any): Promise<User> {
        return this.usersService.create(userData);
    }

    @Get()
    async findAll(
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('isActive') isActive?: string,
    ): Promise<User[]> {
        const activeFilter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.usersService.findAll(search, role, activeFilter);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User> {
        return this.usersService.findOne(id);
    }

    @Get(':id/stats')
    async getStats(@Param('id') id: string) {
        return this.usersService.getStats(id);
    }

    @Get(':id/activity')
    async getActivity(@Param('id') id: string) {
        return this.usersService.getActivity(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<User>,
    ): Promise<User> {
        return this.usersService.update(id, updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.usersService.remove(id);
    }

    @Patch(':id/toggle-status')
    async toggleStatus(@Param('id') id: string): Promise<User> {
        return this.usersService.toggleStatus(id);
    }
}
