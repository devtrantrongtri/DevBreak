import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveTaskDto {
  @ApiProperty({ 
    description: 'Trạng thái mới', 
    enum: ['todo', 'in_process', 'ready_for_qc', 'done']
  })
  @IsEnum(['todo', 'in_process', 'ready_for_qc', 'done'], {
    message: 'Status phải là một trong: todo, in_process, ready_for_qc, done'
  })
  newStatus: 'todo' | 'in_process' | 'ready_for_qc' | 'done';

  @ApiProperty({ description: 'Ghi chú về việc di chuyển', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được quá 500 ký tự' })
  note?: string;
}
