import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MostActiveGroupDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  userCount: number;
}

export class SystemHealthDto {
  @ApiProperty({ enum: ['healthy', 'warning', 'critical'] })
  status: 'healthy' | 'warning' | 'critical';

  @ApiProperty()
  uptime: number;

  @ApiPropertyOptional()
  lastBackup?: Date;

  @ApiPropertyOptional()
  memoryUsage?: number;

  @ApiPropertyOptional()
  diskUsage?: number;
}

export class DashboardStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  totalGroups: number;

  @ApiProperty()
  totalPermissions: number;

  @ApiProperty()
  newUsersToday: number;

  @ApiProperty()
  loginsTodayCount: number;

  @ApiProperty({ type: MostActiveGroupDto })
  mostActiveGroup: MostActiveGroupDto;

  @ApiProperty({ type: SystemHealthDto })
  systemHealth: SystemHealthDto;

  @ApiPropertyOptional()
  totalActivitiesToday?: number;

  @ApiPropertyOptional()
  averageSessionDuration?: number;
}
