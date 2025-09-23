import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { MeetingMessage } from './entities/meeting-message.entity';
import { CreateMeetingDto, JoinMeetingDto, UpdateMeetingParticipantDto, SendMessageDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(MeetingParticipant)
    private readonly participantRepository: Repository<MeetingParticipant>,
    @InjectRepository(MeetingMessage)
    private readonly messageRepository: Repository<MeetingMessage>,
  ) {}

  async create(createMeetingDto: CreateMeetingDto, hostId: string): Promise<Meeting> {
    const roomId = this.generateRoomId();

    // Check if roomId already exists (very unlikely but safety check)
    const existingMeeting = await this.meetingRepository.findOne({ where: { roomId } });
    if (existingMeeting) {
      throw new ConflictException('Room ID conflict. Please try again.');
    }

    const meeting = this.meetingRepository.create({
      ...createMeetingDto,
      roomId,
      hostId,
      status: 'scheduled',
      // Map scheduledStartTime/scheduledEndTime to startTime/endTime if provided
      startTime: createMeetingDto.scheduledStartTime || createMeetingDto.startTime,
      endTime: createMeetingDto.scheduledEndTime || createMeetingDto.endTime,
    });

    const savedMeeting = await this.meetingRepository.save(meeting);

    // Add host as participant
    await this.addParticipant(savedMeeting.id, hostId, 'host');

    // Add invited participants
    if (createMeetingDto.participantIds && createMeetingDto.participantIds.length > 0) {
      for (const participantId of createMeetingDto.participantIds) {
        if (participantId !== hostId) { // Don't add host twice
          await this.addParticipant(savedMeeting.id, participantId, 'participant');
        }
      }
    }

    return this.findOne(savedMeeting.id);
  }

  async findAll(userId: string): Promise<Meeting[]> {
    const meetings = await this.meetingRepository
      .createQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.host', 'host')
      .leftJoinAndSelect('meeting.project', 'project')
      .leftJoinAndSelect('meeting.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'participant_user')
      .where('meeting.hostId = :userId OR participants.userId = :userId', { userId })
      .orderBy('meeting.createdAt', 'DESC')
      .getMany();

    return meetings;
  }

  async findOne(id: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
      relations: ['host', 'project', 'participants', 'participants.user', 'messages', 'messages.sender'],
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with ID "${id}" not found`);
    }

    return meeting;
  }

  async findByRoomId(roomId: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: { roomId },
      relations: ['host', 'project', 'participants', 'participants.user'],
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with room ID "${roomId}" not found`);
    }

    return meeting;
  }

  async update(id: string, updateMeetingDto: UpdateMeetingDto, userId: string): Promise<Meeting> {
    const meeting = await this.findOne(id);

    // Check if user is host or has permission to update
    if (meeting.hostId !== userId) {
      const participant = await this.participantRepository.findOne({
        where: { meetingId: id, userId, role: In(['host', 'co-host']) },
      });
      if (!participant) {
        throw new ForbiddenException('You do not have permission to update this meeting');
      }
    }

    await this.meetingRepository.update(id, updateMeetingDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const meeting = await this.findOne(id);

    // Only host can delete meeting
    if (meeting.hostId !== userId) {
      throw new ForbiddenException('Only the host can delete the meeting');
    }

    const result = await this.meetingRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Meeting with ID "${id}" not found`);
    }
  }

  async joinMeeting(roomId: string, userId: string, joinMeetingDto: JoinMeetingDto): Promise<Meeting> {
    const meeting = await this.findByRoomId(roomId);

    // Check if meeting is active or can be joined
    if (meeting.status === 'ended' || meeting.status === 'cancelled') {
      throw new ConflictException('Meeting has ended or been cancelled');
    }

    // Find or create participant
    let participant = await this.participantRepository.findOne({
      where: { meetingId: meeting.id, userId },
    });

    if (!participant) {
      // Add as new participant
      participant = await this.addParticipant(meeting.id, userId, 'participant');
    } else {
      // Update existing participant
      participant.status = 'joined';
      participant.joinedAt = new Date();
      participant.isVideoEnabled = joinMeetingDto.isVideoEnabled ?? true;
      participant.isAudioEnabled = joinMeetingDto.isAudioEnabled ?? true;
      await this.participantRepository.save(participant);
    }

    // Update meeting status if first participant joins
    if (meeting.status === 'scheduled') {
      meeting.status = 'active';
      meeting.actualStartTime = new Date();
      await this.meetingRepository.save(meeting);
    }

    return this.findOne(meeting.id);
  }

  async leaveMeeting(roomId: string, userId: string): Promise<void> {
    const meeting = await this.findByRoomId(roomId);

    const participant = await this.participantRepository.findOne({
      where: { meetingId: meeting.id, userId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found in meeting');
    }

    participant.status = 'left';
    participant.leftAt = new Date();
    await this.participantRepository.save(participant);

    // Check if all participants left and end meeting
    const activeParticipants = await this.participantRepository.count({
      where: { meetingId: meeting.id, status: 'joined' },
    });

    if (activeParticipants === 0 && meeting.status === 'active') {
      meeting.status = 'ended';
      meeting.actualEndTime = new Date();
      await this.meetingRepository.save(meeting);
    }
  }

  async updateParticipant(
    meetingId: string,
    participantId: string,
    updateDto: UpdateMeetingParticipantDto,
    userId: string,
  ): Promise<MeetingParticipant> {
    const meeting = await this.findOne(meetingId);

    // Check permissions
    const requestingParticipant = await this.participantRepository.findOne({
      where: { meetingId, userId },
    });

    if (!requestingParticipant || !requestingParticipant.canControl) {
      throw new ForbiddenException('You do not have permission to update participants');
    }

    const participant = await this.participantRepository.findOne({
      where: { id: participantId, meetingId },
      relations: ['user'],
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    Object.assign(participant, updateDto);
    return this.participantRepository.save(participant);
  }

  async sendMessage(meetingId: string, senderId: string, messageDto: SendMessageDto): Promise<MeetingMessage> {
    const meeting = await this.findOne(meetingId);

    // Check if sender is participant
    const participant = await this.participantRepository.findOne({
      where: { meetingId, userId: senderId, status: 'joined' },
    });

    if (!participant) {
      throw new ForbiddenException('You must be an active participant to send messages');
    }

    if (!participant.canChat) {
      throw new ForbiddenException('You do not have permission to send messages');
    }

    const newMessage = this.messageRepository.create({
      meetingId,
      senderId,
      ...messageDto,
    });

    const savedMessage = await this.messageRepository.save(newMessage);

    const messageWithRelations = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'replyTo', 'replyTo.sender'],
    });
    
    if (!messageWithRelations) {
      throw new NotFoundException('Message not found after creation');
    }
    
    return messageWithRelations;
  }

  async getMessages(meetingId: string, userId: string, limit = 50, offset = 0): Promise<MeetingMessage[]> {
    // Check if user is participant
    const participant = await this.participantRepository.findOne({
      where: { meetingId, userId },
    });

    if (!participant) {
      throw new ForbiddenException('You must be a participant to view messages');
    }

    return this.messageRepository.find({
      where: { meetingId, isDeleted: false },
      relations: ['sender', 'replyTo', 'replyTo.sender'],
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });
  }

  private async addParticipant(meetingId: string, userId: string, role: string): Promise<MeetingParticipant> {
    const participant = this.participantRepository.create({
      meetingId,
      userId,
      role,
      status: 'joined',
      joinedAt: new Date(),
    });

    return this.participantRepository.save(participant);
  }

  private generateRoomId(): string {
    // Generate a shorter, more user-friendly room ID
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Project-related methods
  async findByProjectId(projectId: string, userId: string): Promise<Meeting[]> {
    const meetings = await this.meetingRepository
      .createQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.host', 'host')
      .leftJoinAndSelect('meeting.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'participant_user')
      .where('meeting.projectId = :projectId', { projectId })
      .andWhere('(meeting.hostId = :userId OR participants.userId = :userId)', { userId })
      .orderBy('meeting.createdAt', 'DESC')
      .getMany();

    return meetings;
  }
}
