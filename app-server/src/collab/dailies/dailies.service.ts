import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Daily } from './entities/daily.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { CreateDailyDto } from './dto/create-daily.dto';
import { UpdateDailyDto } from './dto/update-daily.dto';

@Injectable()
export class DailiesService {
  constructor(
    @InjectRepository(Daily)
    private dailyRepository: Repository<Daily>,
    @InjectRepository(ProjectMember)
    private memberRepository: Repository<ProjectMember>,
  ) {}

  async create(createDailyDto: CreateDailyDto, userId: string): Promise<Daily> {
    // Check if user is member of the project
    await this.checkProjectMembership(createDailyDto.projectId, userId);

    // Check if daily already exists for this user, project, and date
    const existingDaily = await this.dailyRepository.findOne({
      where: {
        projectId: createDailyDto.projectId,
        userId,
        date: createDailyDto.date,
      },
    });

    if (existingDaily) {
      throw new BadRequestException('Daily report đã tồn tại cho ngày này');
    }

    // Create daily
    const daily = this.dailyRepository.create({
      ...createDailyDto,
      userId,
    });

    const savedDaily = await this.dailyRepository.save(daily);
    return this.findOne(savedDaily.id, userId);
  }

  async findAll(projectId: string, userId: string, date?: string): Promise<Daily[]> {
    // Check if user is member of the project
    await this.checkProjectMembership(projectId, userId);

    const queryBuilder = this.dailyRepository
      .createQueryBuilder('daily')
      .leftJoinAndSelect('daily.user', 'user')
      .leftJoinAndSelect('daily.project', 'project')
      .where('daily.project_id = :projectId', { projectId })
      .orderBy('daily.date', 'DESC')
      .addOrderBy('daily.created_at', 'DESC');

    if (date) {
      queryBuilder.andWhere('daily.date = :date', { date });
    }

    const result = await queryBuilder.getMany();
    console.log(`[DailiesService] findAll - projectId: ${projectId}, date: ${date}, found: ${result.length} dailies`);

    return result;
  }

  async findByUser(userId: string, date?: string, projectId?: string): Promise<Daily[]> {
    const queryBuilder = this.dailyRepository
      .createQueryBuilder('daily')
      .leftJoinAndSelect('daily.user', 'user')
      .leftJoinAndSelect('daily.project', 'project')
      .where('daily.user_id = :userId', { userId })
      .orderBy('daily.date', 'DESC');

    if (date) {
      queryBuilder.andWhere('daily.date = :date', { date });
    }

    if (projectId) {
      // Check if user is member of the project
      await this.checkProjectMembership(projectId, userId);
      queryBuilder.andWhere('daily.project_id = :projectId', { projectId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<Daily> {
    const daily = await this.dailyRepository.findOne({
      where: { id },
      relations: ['user', 'project'],
    });

    if (!daily) {
      throw new NotFoundException('Không tìm thấy daily report');
    }

    // Check if user is member of the project
    await this.checkProjectMembership(daily.projectId, userId);

    return daily;
  }

  async update(id: string, updateDailyDto: UpdateDailyDto, userId: string): Promise<Daily> {
    const daily = await this.findOne(id, userId);

    // Only the creator can update their daily
    if (daily.userId !== userId) {
      throw new ForbiddenException('Chỉ có thể cập nhật daily report của chính mình');
    }

    // Update daily
    Object.assign(daily, updateDailyDto);
    const updatedDaily = await this.dailyRepository.save(daily);

    return this.findOne(updatedDaily.id, userId);
  }

  // Helper methods
  private async checkProjectMembership(projectId: string, userId: string): Promise<ProjectMember> {
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('Bạn không phải là thành viên của dự án này');
    }

    return member;
  }
}
