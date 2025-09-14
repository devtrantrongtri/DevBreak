import { ApiProperty } from '@nestjs/swagger';

export class GrowthDataDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  year: number;

  @ApiProperty()
  newUsers: number;

  @ApiProperty()
  newGroups: number;

  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalGroups: number;

  @ApiProperty()
  monthName: string; // e.g., "January", "February"
}
