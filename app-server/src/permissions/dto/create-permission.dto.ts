import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'dashboard.view', description: 'Unique permission code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'View Dashboard', description: 'Human readable name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Allows user to view the dashboard', description: 'Description of what this permission allows', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'system.manage', description: 'Parent permission code for hierarchical permissions', required: false })
  @IsOptional()
  @IsString()
  parentCode?: string;

  @ApiProperty({ example: true, description: 'Whether this permission is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
