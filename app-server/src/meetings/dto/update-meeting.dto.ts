import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsBoolean, IsDateString, IsIn, Length } from 'class-validator';
import { CreateMeetingDto } from './create-meeting.dto';

export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsIn(['scheduled', 'active', 'ended', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  isVideoEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isAudioEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isChatEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecording?: boolean;

  @IsOptional()
  settings?: Record<string, any>;
}
