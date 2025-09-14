import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignGroupsDto {
  @ApiProperty({ example: ['uuid1', 'uuid2'], description: 'Array of group IDs to assign to the user' })
  @IsArray()
  @IsUUID('4', { each: true })
  groupIds: string[];
}
