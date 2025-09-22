import { IsString, IsUUID, IsDateString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDailyDto {
  @ApiProperty({ description: 'ID dự án', example: 'uuid-here' })
  @IsUUID('4', { message: 'Project ID phải là UUID hợp lệ' })
  projectId: string;

  @ApiProperty({ description: 'Ngày báo cáo', example: '2025-09-21' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date phải có format YYYY-MM-DD' })
  date: string;

  @ApiProperty({ description: 'Công việc đã làm hôm qua', example: 'Hoàn thành task ABC, review code XYZ' })
  @IsString()
  @MinLength(1, { message: 'Yesterday phải có ít nhất 1 ký tự' })
  @MaxLength(1000, { message: 'Yesterday không được quá 1000 ký tự' })
  yesterday: string;

  @ApiProperty({ description: 'Kế hoạch công việc hôm nay', example: 'Implement feature DEF, fix bug GHI' })
  @IsString()
  @MinLength(1, { message: 'Today phải có ít nhất 1 ký tự' })
  @MaxLength(1000, { message: 'Today không được quá 1000 ký tự' })
  today: string;

  @ApiProperty({ description: 'Blockers hoặc vấn đề cần hỗ trợ', required: false })
  @IsString()
  @MaxLength(500, { message: 'Blockers không được quá 500 ký tự' })
  blockers?: string;
}
