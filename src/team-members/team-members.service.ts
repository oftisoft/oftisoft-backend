import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
  ) {}

  async create(dto: CreateTeamMemberDto): Promise<TeamMember> {
    const member = this.teamMembersRepository.create(dto);
    return this.teamMembersRepository.save(member);
  }

  async findAll(): Promise<TeamMember[]> {
    return this.teamMembersRepository.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findAllActive(): Promise<TeamMember[]> {
    return this.teamMembersRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<TeamMember> {
    const member = await this.teamMembersRepository.findOne({ where: { id } });
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  async update(id: string, dto: UpdateTeamMemberDto): Promise<TeamMember> {
    const member = await this.findOne(id);
    Object.assign(member, dto);
    return this.teamMembersRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);
    await this.teamMembersRepository.remove(member);
  }
}
