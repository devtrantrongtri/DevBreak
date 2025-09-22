import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ description: 'Ghi chú về thay đổi', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được quá 500 ký tự' })
  changeNote?: string;
}

export class MoveTaskDto {
  @ApiProperty({ 
    description: 'Trạng thái mới', 
    enum: ['todo', 'in_process', 'ready_for_qc', 'done']
  })
  @IsString()
  newStatus: 'todo' | 'in_process' | 'ready_for_qc' | 'done';

  @ApiProperty({ description: 'Ghi chú về việc di chuyển', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được quá 500 ký tự' })
  note?: string;
}
