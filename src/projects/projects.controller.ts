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
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user?.id);
  }

  @Get()
  findAll(@Query('status') status: string, @Request() req) {
    const userId =
      req.user?.role === 'Admin' || req.user?.role === 'Editor'
        ? undefined
        : req.user?.id;
    return this.projectsService.findAll(userId, status);
  }

  @Get('stats')
  getStats(@Request() req) {
    const userId =
      req.user?.role === 'Admin' || req.user?.role === 'Editor'
        ? undefined
        : req.user?.id;
    return this.projectsService.getStats(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: string,
  ) {
    return this.projectsService.updatePaymentStatus(id, paymentStatus);
  }
}
