import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { DashboardStatsDto, GrowthDataDto, ActivityTrendDto } from './dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @RequirePermissions('dashboard.view')
  @UseInterceptors(CacheInterceptor) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard statistics retrieved successfully.', 
    type: DashboardStatsDto 
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getDashboardStats();
  }

  @Get('user-growth')
  @RequirePermissions('dashboard.view')
  @UseInterceptors(CacheInterceptor) // Cache for 10 minutes
  @ApiOperation({ summary: 'Get user growth data by month' })
  @ApiQuery({ 
    name: 'months', 
    required: false, 
    type: Number, 
    description: 'Number of months to retrieve (default: 6)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User growth data retrieved successfully.', 
    type: [GrowthDataDto] 
  })
  async getUserGrowthData(
    @Query('months') months: number = 6
  ): Promise<GrowthDataDto[]> {
    // Validate months parameter
    const validMonths = Math.min(Math.max(parseInt(months.toString()) || 6, 1), 24);
    return this.dashboardService.getUserGrowthData(validMonths);
  }

  @Get('activity-trends')
  @RequirePermissions('dashboard.view')
  @UseInterceptors(CacheInterceptor) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get activity trends by day' })
  @ApiQuery({ 
    name: 'days', 
    required: false, 
    type: Number, 
    description: 'Number of days to retrieve (default: 7)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Activity trends retrieved successfully.', 
    type: [ActivityTrendDto] 
  })
  async getActivityTrends(
    @Query('days') days: number = 7
  ): Promise<ActivityTrendDto[]> {
    // Validate days parameter
    const validDays = Math.min(Math.max(parseInt(days.toString()) || 7, 1), 90);
    return this.dashboardService.getActivityTrends(validDays);
  }

  @Get('health')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health status retrieved successfully.' })
  async getSystemHealth() {
    const stats = await this.dashboardService.getDashboardStats();
    return stats.systemHealth;
  }

  @Get('quick-stats')
  @RequirePermissions('dashboard.view')
  @UseInterceptors(CacheInterceptor) // Cache for 2 minutes
  @ApiOperation({ summary: 'Get quick statistics for dashboard widgets' })
  @ApiResponse({ status: 200, description: 'Quick statistics retrieved successfully.' })
  async getQuickStats() {
    const stats = await this.dashboardService.getDashboardStats();
    return {
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      newUsersToday: stats.newUsersToday,
      loginsTodayCount: stats.loginsTodayCount,
      totalActivitiesToday: stats.totalActivitiesToday,
    };
  }


}
