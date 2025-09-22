import { IsArray, IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({ example: ['dashboard.view', 'system.manage', 'user.create'], description: 'Array of permission codes to assign' })
  @IsArray()
  @IsString({ each: true })
  permissionCodes: string[];
}

export class UpsertGroupUsersDto {
  @ApiProperty({ example: ['uuid1', 'uuid2'], description: 'Array of user IDs to add to the group', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  addUserIds?: string[];

  @ApiProperty({ example: ['uuid3', 'uuid4'], description: 'Array of user IDs to remove from the group', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  removeUserIds?: string[];
}
