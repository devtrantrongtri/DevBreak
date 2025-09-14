import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Dashboard', description: 'Display name of the menu item' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '/dashboard', description: 'Route path for navigation' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ example: 'DashboardOutlined', description: 'Icon name for the menu item', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 0, description: 'Sort order within the same level', required: false })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ example: true, description: 'Whether the menu item is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'dashboard.view', description: 'Permission code required to access this menu' })
  @IsString()
  @IsNotEmpty()
  permissionCode: string;

  @ApiProperty({ example: 'uuid-parent-id', description: 'Parent menu ID for hierarchical structure', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
