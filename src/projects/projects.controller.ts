import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
        return this.projectsService.create(createProjectDto, req.user.userId);
    }

    @Get()
    findAll(@Query('status') status: string, @Request() req) {
        return this.projectsService.findAll(req.user.userId, status);
    }

    @Get('stats')
    getStats(@Request() req) {
        return this.projectsService.getStats(req.user.userId);
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
    updatePaymentStatus(@Param('id') id: string, @Body('paymentStatus') paymentStatus: string) {
        return this.projectsService.updatePaymentStatus(id, paymentStatus);
    }
}
