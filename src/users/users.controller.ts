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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SuperAdmin', 'Admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('SuperAdmin', 'Admin')
  async create(@Body() userData: any): Promise<User> {
    return this.usersService.create(userData);
  }

  @Get()
  @Roles('SuperAdmin', 'Admin', 'Support')
  async findAll(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ): Promise<User[]> {
    const activeFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.usersService.findAll(search, role, activeFilter);
  }

  @Get(':id')
  @Roles('SuperAdmin', 'Admin', 'Support')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Get(':id/stats')
  @Roles('SuperAdmin', 'Admin')
  async getStats(@Param('id') id: string) {
    return this.usersService.getStats(id);
  }

  @Get(':id/activity')
  @Roles('SuperAdmin', 'Admin')
  async getActivity(@Param('id') id: string) {
    return this.usersService.getActivity(id);
  }

  @Patch(':id')
  @Roles('SuperAdmin', 'Admin')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @Roles('SuperAdmin')
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles('SuperAdmin', 'Admin')
  async toggleStatus(@Param('id') id: string): Promise<User> {
    return this.usersService.toggleStatus(id);
  }
}
