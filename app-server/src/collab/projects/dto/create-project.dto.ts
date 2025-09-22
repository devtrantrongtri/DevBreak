import { IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: 'Tên dự án', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả dự án' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Mã dự án (unique)', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: 'Ngày bắt đầu dự án', format: 'date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc dự án', format: 'date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
