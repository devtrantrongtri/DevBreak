import { IsString, IsOptional, IsBoolean, IsDateString, IsUUID, IsIn, Length, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMeetingDto {
  @IsString()
  @Length(1, 255)
  title: string;

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
  @IsUUID()
  projectId?: string;

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
  settings?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];

  @IsOptional()
  @IsDateString()
  scheduledStartTime?: string;

  @IsOptional()
  @IsDateString()
  scheduledEndTime?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  maxParticipants?: number;

  @IsOptional()
  @IsBoolean()
  allowRecording?: boolean;
}

export class JoinMeetingDto {
  @IsString()
  roomId: string;

  @IsOptional()
  @IsBoolean()
  isVideoEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isAudioEnabled?: boolean;
}

export class UpdateMeetingParticipantDto {
  @IsOptional()
  @IsIn(['host', 'co-host', 'participant', 'viewer'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  isVideoEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isAudioEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;

  @IsOptional()
  @IsBoolean()
  canSpeak?: boolean;

  @IsOptional()
  @IsBoolean()
  canChat?: boolean;
}

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsIn(['text', 'file', 'image', 'system', 'reaction'])
  type?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
