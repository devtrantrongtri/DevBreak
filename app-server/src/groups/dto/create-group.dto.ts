import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'admin', description: 'Unique group code/identifier' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Administrators', description: 'Display name of the group' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'System administrators with full access', description: 'Description of the group', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, description: 'Whether the group is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
