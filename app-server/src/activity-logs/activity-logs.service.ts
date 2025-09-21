import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ActivityLog } from '../entities/ActivityLog';
import { User } from '../entities/User';
import { 
  CreateActivityLogDto, 
  GetActivityLogsDto, 
  ActivityLogResponseDto, 
  PaginatedActivityLogsDto,
  UserSummaryDto 
} from './dto';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto, userId?: string): Promise<ActivityLog> {
    const activityLogData: Partial<ActivityLog> = {
      ...createActivityLogDto,
    };

    // Only set user if userId is provided
    if (userId) {
      // Create a user reference for the relationship
      const userRef = this.userRepository.create({ id: userId });
      activityLogData.user = userRef;
    } else {
      activityLogData.user = null;
    }

    const activityLog = this.activityLogRepository.create(activityLogData);
    return this.activityLogRepository.save(activityLog);
  }

  async findAll(query: GetActivityLogsDto): Promise<PaginatedActivityLogsDto> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.createQueryBuilder(filters);
    
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const mappedData = data.map(log => this.mapToResponseDto(log));

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(userId: string, query: GetActivityLogsDto): Promise<PaginatedActivityLogsDto> {
    return this.findAll({ ...query, userId });
  }

  async findRecent(limit: number = 10): Promise<ActivityLogResponseDto[]> {
    const data = await this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    return data.map(log => this.mapToResponseDto(log));
  }

  async logActivity(
    action: string,
    resource: string,
    ipAddress: string,
    userId?: string,
    resourceId?: string,
    details?: Record<string, any>,
    userAgent?: string,
    method?: string,
    path?: string,
    status: string = 'success'
  ): Promise<ActivityLog | null> {
    try {
      const createDto: CreateActivityLogDto = {
        action: action as any,
        resource: resource as any,
        resourceId,
        details,
        ipAddress,
        userAgent,
        method,
        path,
        status: status as any,
      };

      const activityLog = await this.create(createDto, userId);
      return activityLog;
    } catch (error) {
      // Log error but don't throw to avoid breaking the main operation
      console.error('Failed to log activity:', error);
      return null;
    }
  }



  private createQueryBuilder(filters: Partial<GetActivityLogsDto>): SelectQueryBuilder<ActivityLog> {
    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC');

    if (filters.userId) {
      queryBuilder.andWhere('log.user.id = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      queryBuilder.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters.resource) {
      queryBuilder.andWhere('log.resource = :resource', { resource: filters.resource });
    }

    if (filters.resourceId) {
      queryBuilder.andWhere('log.resourceId = :resourceId', { resourceId: filters.resourceId });
    }

    if (filters.status) {
      queryBuilder.andWhere('log.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(log.action ILIKE :search OR log.resource ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder;
  }

  private mapToResponseDto(log: ActivityLog): ActivityLogResponseDto {
    return {
      id: log.id,
      user: log.user ? {
        id: log.user.id,
        displayName: log.user.displayName,
        email: log.user.email,
      } : null,
      action: log.action as any,
      resource: log.resource as any,
      resourceId: log.resourceId,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      method: log.method,
      path: log.path,
      status: log.status as any,
      createdAt: log.createdAt,
    };
  }
}
