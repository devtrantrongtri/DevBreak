import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto, JoinMeetingDto, UpdateMeetingParticipantDto, SendMessageDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('meetings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @RequirePermissions('meetings.create')
  create(@Body() createMeetingDto: CreateMeetingDto, @Request() req: any) {
    return this.meetingsService.create(createMeetingDto, req.user.userId);
  }

  @Get()
  @RequirePermissions('meetings.view')
  findAll(@Request() req: any) {
    return this.meetingsService.findAll(req.user.userId);
  }

  @Get('project/:projectId')
  @RequirePermissions('meetings.view')
  findByProject(@Param('projectId') projectId: string, @Request() req: any) {
    return this.meetingsService.findByProjectId(projectId, req.user.userId);
  }

  @Get(':id')
  @RequirePermissions('meetings.view')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Get('room/:roomId')
  @RequirePermissions('meetings.view')
  findByRoomId(@Param('roomId') roomId: string) {
    return this.meetingsService.findByRoomId(roomId);
  }

  @Patch(':id')
  @RequirePermissions('meetings.update')
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto, @Request() req: any) {
    return this.meetingsService.update(id, updateMeetingDto, req.user.userId);
  }

  @Delete(':id')
  @RequirePermissions('meetings.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.meetingsService.remove(id, req.user.userId);
  }

  @Post('join/:roomId')
  @RequirePermissions('meetings.join')
  joinMeeting(@Param('roomId') roomId: string, @Body() joinMeetingDto: JoinMeetingDto, @Request() req: any) {
    return this.meetingsService.joinMeeting(roomId, req.user.userId, joinMeetingDto);
  }

  @Post('leave/:roomId')
  @RequirePermissions('meetings.join')
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveMeeting(@Param('roomId') roomId: string, @Request() req: any) {
    return this.meetingsService.leaveMeeting(roomId, req.user.userId);
  }

  @Patch(':meetingId/participants/:participantId')
  @RequirePermissions('meetings.manage')
  updateParticipant(
    @Param('meetingId') meetingId: string,
    @Param('participantId') participantId: string,
    @Body() updateDto: UpdateMeetingParticipantDto,
    @Request() req: any,
  ) {
    return this.meetingsService.updateParticipant(meetingId, participantId, updateDto, req.user.userId);
  }

  @Post(':meetingId/messages')
  @RequirePermissions('meetings.chat')
  sendMessage(@Param('meetingId') meetingId: string, @Body() messageDto: SendMessageDto, @Request() req: any) {
    return this.meetingsService.sendMessage(meetingId, req.user.userId, messageDto);
  }

  @Get(':meetingId/messages')
  @RequirePermissions('meetings.chat')
  getMessages(
    @Param('meetingId') meetingId: string,
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.meetingsService.getMessages(
      meetingId,
      req.user.userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }
}
