import { ApiProperty } from '@nestjs/swagger';

export class ActivityTrendDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  logins: number;

  @ApiProperty()
  userCreations: number;

  @ApiProperty()
  userUpdates: number;

  @ApiProperty()
  groupOperations: number;

  @ApiProperty()
  totalActivities: number;

  @ApiProperty()
  dayName: string; // e.g., "Monday", "Tuesday"
}
