import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityAction, ActivityResource, ActivityStatus } from './create-activity-log.dto';

export class UserSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;
}

export class ActivityLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ type: UserSummaryDto })
  user?: UserSummaryDto | null;

  @ApiProperty({ enum: ActivityAction })
  action: ActivityAction;

  @ApiProperty({ enum: ActivityResource })
  resource: ActivityResource;

  @ApiPropertyOptional()
  resourceId?: string | null;

  @ApiPropertyOptional()
  details?: Record<string, any> | null;

  @ApiProperty()
  ipAddress: string;

  @ApiPropertyOptional()
  userAgent?: string | null;

  @ApiPropertyOptional()
  method?: string | null;

  @ApiPropertyOptional()
  path?: string | null;

  @ApiProperty({ enum: ActivityStatus })
  status: ActivityStatus;

  @ApiProperty()
  createdAt: Date;
}

export class PaginatedActivityLogsDto {
  @ApiProperty({ type: [ActivityLogResponseDto] })
  data: ActivityLogResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
