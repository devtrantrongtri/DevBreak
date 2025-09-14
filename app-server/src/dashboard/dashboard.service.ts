import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Group, Permission, ActivityLog } from '../entities';
import { DashboardStatsDto, GrowthDataDto, ActivityTrendDto, MostActiveGroupDto, SystemHealthDto } from './dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
    @InjectRepository(ActivityLog) private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const [
      totalUsers,
      activeUsers,
      totalGroups,
      totalPermissions,
      newUsersToday,
      loginsTodayCount,
      mostActiveGroup,
      totalActivitiesToday
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.groupRepository.count(),
      this.permissionRepository.count(),
      this.getUsersCreatedToday(),
      this.getLoginsTodayCount(),
      this.getMostActiveGroup(),
      this.getActivitiesTodayCount()
    ]);

    const systemHealth = await this.getSystemHealth();

    return {
      totalUsers,
      activeUsers,
      totalGroups,
      totalPermissions,
      newUsersToday,
      loginsTodayCount,
      mostActiveGroup,
      systemHealth,
      totalActivitiesToday,
      averageSessionDuration: 0, // TODO: Implement session tracking
    };
  }

  async getUserGrowthData(months: number = 6): Promise<GrowthDataDto[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1); // Start from first day of the month

    // Get user growth data - only count users created in each specific month
    const userGrowthQuery = `
      SELECT
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as new_users
      FROM users
      WHERE "createdAt" >= $1
        AND "deletedAt" IS NULL
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    const userGrowthData = await this.userRepository.query(userGrowthQuery, [startDate]);

    // Get group growth data - only count groups created in each specific month
    const groupGrowthQuery = `
      SELECT
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as new_groups
      FROM groups
      WHERE "createdAt" >= $1
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    const groupGrowthData = await this.groupRepository.query(groupGrowthQuery, [startDate]);



    // Combine and format data
    return this.combineGrowthData(userGrowthData, groupGrowthData, months);
  }

  async getActivityTrends(days: number = 7): Promise<ActivityTrendDto[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const query = `
      SELECT
        DATE("createdAt") as date,
        action,
        resource,
        COUNT(*) as count
      FROM activity_logs
      WHERE "createdAt" >= $1
      GROUP BY DATE("createdAt"), action, resource
      ORDER BY date ASC
    `;

    const rawData = await this.activityLogRepository.query(query, [startDate]);
    return this.processActivityTrends(rawData, days);
  }

  private async getUsersCreatedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :today', { today })
      .andWhere('user.createdAt < :tomorrow', { tomorrow })
      .getCount();
  }

  private async getLoginsTodayCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.action = :action', { action: 'login' })
      .andWhere('log.createdAt >= :today', { today })
      .andWhere('log.createdAt < :tomorrow', { tomorrow })
      .getCount();
  }

  private async getActivitiesTodayCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.createdAt >= :today', { today })
      .andWhere('log.createdAt < :tomorrow', { tomorrow })
      .getCount();
  }

  private async getMostActiveGroup(): Promise<MostActiveGroupDto> {
    const query = `
      SELECT
        g.name,
        COUNT(ug.user_id) as user_count
      FROM groups g
      LEFT JOIN user_groups ug ON g.id = ug.group_id
      WHERE g."isActive" = true
      GROUP BY g.id, g.name
      ORDER BY user_count DESC
      LIMIT 1
    `;

    const result = await this.groupRepository.query(query);

    if (result.length > 0) {
      return {
        name: result[0].name,
        userCount: parseInt(result[0].user_count),
      };
    }

    return { name: 'N/A', userCount: 0 };
  }

  private async getSystemHealth(): Promise<SystemHealthDto> {
    // Simple health check - can be expanded
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    // Simple health logic
    if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9) {
      status = 'critical';
    } else if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.7) {
      status = 'warning';
    }

    return {
      status,
      uptime,
      memoryUsage: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100, // MB
      diskUsage: 0, // TODO: Implement disk usage check
    };
  }

  private combineGrowthData(userGrowthData: any[], groupGrowthData: any[], months: number): GrowthDataDto[] {
    const result: GrowthDataDto[] = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];



    // Generate data for each month in the requested range
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);

      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format

      const userGrowth = userGrowthData.find(item =>
        item.month.toISOString().substring(0, 7) === monthKey
      );

      const groupGrowth = groupGrowthData.find(item =>
        item.month.toISOString().substring(0, 7) === monthKey
      );

      const newUsers = userGrowth ? parseInt(userGrowth.new_users) : 0;
      const newGroups = groupGrowth ? parseInt(groupGrowth.new_groups) : 0;



      result.push({
        month: monthKey,
        year: date.getFullYear(),
        newUsers,
        newGroups,
        totalUsers: 0, // TODO: Calculate cumulative total
        totalGroups: 0, // TODO: Calculate cumulative total
        monthName: monthNames[date.getMonth()],
      });
    }

    return result;
  }

  private processActivityTrends(rawData: any[], days: number): ActivityTrendDto[] {
    const result: ActivityTrendDto[] = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Generate data for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().substring(0, 10); // YYYY-MM-DD format

      const dayData = rawData.filter(item => 
        item.date.toISOString().substring(0, 10) === dateKey
      );

      const logins = dayData.find(item => item.action === 'login')?.count || 0;
      const userCreations = dayData.find(item => item.action === 'create' && item.resource === 'user')?.count || 0;
      const userUpdates = dayData.find(item => item.action === 'update' && item.resource === 'user')?.count || 0;
      const groupOperations = dayData.filter(item => item.resource === 'group').reduce((sum, item) => sum + parseInt(item.count), 0);
      const totalActivities = dayData.reduce((sum, item) => sum + parseInt(item.count), 0);

      result.push({
        date: dateKey,
        logins: parseInt(logins),
        userCreations: parseInt(userCreations),
        userUpdates: parseInt(userUpdates),
        groupOperations,
        totalActivities,
        dayName: dayNames[date.getDay()],
      });
    }

    return result;
  }


}
