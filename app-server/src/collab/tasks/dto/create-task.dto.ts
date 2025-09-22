import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, IsDateString, MinLength, MaxLength, Min, Max, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Tiêu đề task', example: 'Implement user authentication' })
  @IsString()
  @MinLength(1, { message: 'Tiêu đề phải có ít nhất 1 ký tự' })
  @MaxLength(200, { message: 'Tiêu đề không được quá 200 ký tự' })
  title: string;

  @ApiProperty({ description: 'Mô tả chi tiết task', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Mô tả không được quá 1000 ký tự' })
  description?: string;

  @ApiProperty({ description: 'ID dự án', example: 'uuid-here' })
  @IsUUID('4', { message: 'Project ID phải là UUID hợp lệ' })
  projectId: string;

  @ApiProperty({ 
    description: 'Trạng thái task', 
    enum: ['todo', 'in_process', 'ready_for_qc', 'done'],
    default: 'todo'
  })
  @IsOptional()
  @IsEnum(['todo', 'in_process', 'ready_for_qc', 'done'], {
    message: 'Status phải là một trong: todo, in_process, ready_for_qc, done'
  })
  status?: 'todo' | 'in_process' | 'ready_for_qc' | 'done';

  @ApiProperty({ 
    description: 'Độ ưu tiên', 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'], {
    message: 'Priority phải là một trong: low, medium, high, urgent'
  })
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @ApiProperty({ description: 'ID user được assign', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'Assigned user ID phải là UUID hợp lệ' })
  assignedTo?: string;

  @ApiProperty({ description: 'Ngày hạn hoàn thành', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Due date phải có format YYYY-MM-DD' })
  dueDate?: string;

  @ApiProperty({ description: 'Ước tính thời gian (giờ)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Estimated hours phải là số' })
  @Min(0.5, { message: 'Estimated hours phải ít nhất 0.5 giờ' })
  @Max(100, { message: 'Estimated hours không được quá 100 giờ' })
  estimatedHours?: number;
}
