import { IsUUID, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ description: 'ID của user' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Vai trò trong dự án', enum: ['PM', 'BC', 'DEV', 'QC'] })
  @IsEnum(['PM', 'BC', 'DEV', 'QC'])
  role: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ description: 'Vai trò mới', enum: ['PM', 'BC', 'DEV', 'QC'] })
  @IsEnum(['PM', 'BC', 'DEV', 'QC'])
  role: string;
}

export class BulkAddMembersDto {
  @ApiProperty({ description: 'Danh sách members cần thêm', type: [AddMemberDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddMemberDto)
  members: AddMemberDto[];
}
