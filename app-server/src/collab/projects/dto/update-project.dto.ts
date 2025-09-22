import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsEnum(['active', 'inactive', 'completed', 'archived'])
  @IsOptional()
  status?: string;
}
