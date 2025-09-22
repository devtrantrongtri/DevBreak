import { PartialType } from '@nestjs/swagger';
import { CreateDailyDto } from './create-daily.dto';

export class UpdateDailyDto extends PartialType(CreateDailyDto) {
  // Exclude projectId and date from updates
  projectId?: never;
  date?: never;
}
