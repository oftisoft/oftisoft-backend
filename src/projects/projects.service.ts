import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
    ) { }

    async create(createProjectDto: CreateProjectDto, userId?: string): Promise<Project> {
        const project = this.projectsRepository.create({
            ...createProjectDto,
            userId,
        });
        return this.projectsRepository.save(project);
    }

    async findAll(userId?: string, status?: string): Promise<Project[]> {
        const where: any = {};

        if (userId) {
            where.userId = userId;
        }

        if (status && status !== 'All') {
            where.status = status;
        }

        return this.projectsRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Project> {
        const project = await this.projectsRepository.findOne({ where: { id } });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
        const project = await this.findOne(id);
        Object.assign(project, updateProjectDto);
        return this.projectsRepository.save(project);
    }

    async remove(id: string): Promise<void> {
        const project = await this.findOne(id);
        await this.projectsRepository.remove(project);
    }

    async getStats(userId?: string): Promise<any> {
        const where: any = userId ? { userId } : {};

        const [total, inProgress, completed, delayed] = await Promise.all([
            this.projectsRepository.count({ where }),
            this.projectsRepository.count({ where: { ...where, status: 'In Progress' } }),
            this.projectsRepository.count({ where: { ...where, status: 'Completed' } }),
            this.projectsRepository.count({ where: { ...where, status: 'Delayed' } }),
        ]);

        return {
            total,
            inProgress,
            completed,
            delayed,
        };
    }

    async updatePaymentStatus(id: string, paymentStatus: string): Promise<Project> {
        const project = await this.findOne(id);
        project.paymentStatus = paymentStatus;
        return this.projectsRepository.save(project);
    }
}
