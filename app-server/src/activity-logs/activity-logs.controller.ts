import { Controller, Get, Post, Body, Query, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ActivityLogsService } from './activity-logs.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { 
  CreateActivityLogDto, 
  GetActivityLogsDto, 
  ActivityLogResponseDto, 
  PaginatedActivityLogsDto 
} from './dto';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Post()
  @RequirePermissions('system.manage') // Only system admin can manually create logs
  @ApiOperation({ summary: 'Create a new activity log entry' })
  @ApiResponse({ status: 201, description: 'Activity log created successfully.' })
  async create(
    @Body() createActivityLogDto: CreateActivityLogDto,
    @Request() req: any
  ) {
    return this.activityLogsService.create(createActivityLogDto, req.user.userId);
  }

  @Get()
  @RequirePermissions('audit.view')
  @ApiOperation({ summary: 'Get all activity logs with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Activity logs retrieved successfully.', type: PaginatedActivityLogsDto })
  async findAll(
    @Query() query: GetActivityLogsDto,
    @Request() req: any
  ): Promise<PaginatedActivityLogsDto> {
    // Check if user has permission to view all logs
    const canViewAll = req.user.effectivePermissions?.includes('audit.manage');

    if (canViewAll) {
      // Admin can see all logs
      return this.activityLogsService.findAll(query);
    } else {
      // Regular user can only see their own logs
      return this.activityLogsService.findAll({ ...query, userId: req.user.userId });
    }
  }

  @Get('recent')
  @RequirePermissions('dashboard.view')
  @ApiOperation({ summary: 'Get recent activities for dashboard' })
  @ApiResponse({ status: 200, description: 'Recent activities retrieved successfully.', type: [ActivityLogResponseDto] })
  async getRecentActivities(
    @Query('limit') limit: number = 10
  ): Promise<ActivityLogResponseDto[]> {
    return this.activityLogsService.findRecent(limit);
  }

  @Get('user/:userId')
  @RequirePermissions('audit.view')
  @ApiOperation({ summary: 'Get activity logs for a specific user' })
  @ApiResponse({ status: 200, description: 'User activity logs retrieved successfully.', type: PaginatedActivityLogsDto })
  async getUserActivityLogs(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: GetActivityLogsDto,
    @Request() req: any
  ): Promise<PaginatedActivityLogsDto> {
    // Check if user has permission to view all logs or is viewing their own
    const canViewAll = req.user.effectivePermissions?.includes('audit.manage');
    const isOwnLogs = userId === req.user.userId;

    if (!canViewAll && !isOwnLogs) {
      throw new Error('You can only view your own activity logs');
    }

    return this.activityLogsService.findByUserId(userId, query);
  }

  @Get('my-activities')
  @ApiOperation({ summary: 'Get current user\'s activity logs' })
  @ApiResponse({ status: 200, description: 'Current user activity logs retrieved successfully.', type: PaginatedActivityLogsDto })
  async getMyActivities(
    @Request() req: any,
    @Query() query: GetActivityLogsDto
  ): Promise<PaginatedActivityLogsDto> {
    return this.activityLogsService.findByUserId(req.user.userId, query);
  }
}
