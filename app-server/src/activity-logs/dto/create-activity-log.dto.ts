import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ActivityAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
}

export enum ActivityResource {
  USER = 'user',
  GROUP = 'group',
  PERMISSION = 'permission',
  MENU = 'menu',
  PROFILE = 'profile',
  SYSTEM = 'system',
}

export enum ActivityStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export class CreateActivityLogDto {
  @ApiProperty({ enum: ActivityAction, description: 'Type of action performed' })
  @IsEnum(ActivityAction)
  action: ActivityAction;

  @ApiProperty({ enum: ActivityResource, description: 'Resource that was affected' })
  @IsEnum(ActivityResource)
  resource: ActivityResource;

  @ApiPropertyOptional({ description: 'ID of the affected resource' })
  @IsOptional()
  @IsString()
  resourceId?: string | null;

  @ApiPropertyOptional({ description: 'Additional details about the action' })
  @IsOptional()
  @IsObject()
  details?: Record<string, any> | null;

  @ApiProperty({ description: 'IP address of the user' })
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsOptional()
  @IsString()
  userAgent?: string | null;

  @ApiPropertyOptional({ description: 'HTTP method used' })
  @IsOptional()
  @IsString()
  method?: string | null;

  @ApiPropertyOptional({ description: 'Request path' })
  @IsOptional()
  @IsString()
  path?: string | null;

  @ApiPropertyOptional({ enum: ActivityStatus, description: 'Status of the action' })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;
}
