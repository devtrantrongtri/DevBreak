import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MeetingsService } from './meetings.service';
// WebSocket authentication is handled in handleConnection method

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  meetingRooms?: Set<string>;
}

interface WebRTCOffer {
  type: 'offer';
  sdp: string;
}

interface WebRTCAnswer {
  type: 'answer';
  sdp: string;
}

interface WebRTCIceCandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

interface ParticipantUpdate {
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isScreenSharing?: boolean;
  isMuted?: boolean;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/meetings',
})
export class MeetingWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MeetingWebSocketGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();
  private roomParticipants = new Map<string, Set<string>>(); // roomId -> Set of socketIds

  constructor(
    private jwtService: JwtService,
    private meetingsService: MeetingsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token as string;

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;
      client.userEmail = payload.email;
      client.meetingRooms = new Set();

      this.connectedClients.set(client.id, client);

      this.logger.log(`User ${client.userEmail} connected to meetings (${client.id})`);
      
      client.emit('connected', {
        message: 'Connected to meeting service',
        userId: client.userId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.emit('auth_error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    // Leave all meeting rooms
    if (client.meetingRooms) {
      client.meetingRooms.forEach(roomId => {
        this.leaveRoom(client, roomId);
      });
    }

    this.connectedClients.delete(client.id);
    this.logger.log(`User ${client.userEmail || 'Unknown'} disconnected from meetings (${client.id})`);
  }

  @SubscribeMessage('join_meeting')
  async handleJoinMeeting(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ) {
    try {
      const { roomId } = data;

      // Verify meeting exists and user has access
      const meeting = await this.meetingsService.findByRoomId(roomId);
      
      // Join socket room
      client.join(roomId);
      client.meetingRooms?.add(roomId);

      // Track participants
      if (!this.roomParticipants.has(roomId)) {
        this.roomParticipants.set(roomId, new Set());
      }
      this.roomParticipants.get(roomId)?.add(client.id);

      this.logger.log(`User ${client.userEmail} joined meeting room: ${roomId}`);

      // Notify other participants
      client.to(roomId).emit('participant_joined', {
        userId: client.userId,
        userEmail: client.userEmail,
        socketId: client.id,
        timestamp: new Date().toISOString(),
      });

      // Send current participants to the new user
      const participants = this.getRoomParticipants(roomId);
      client.emit('room_participants', {
        participants,
        timestamp: new Date().toISOString(),
      });

      client.emit('joined_meeting', {
        roomId,
        message: 'Successfully joined meeting',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Error joining meeting:`, error.message);
      client.emit('meeting_error', { message: error.message });
    }
  }

  @SubscribeMessage('leave_meeting')
  handleLeaveMeeting(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ) {
    const { roomId } = data;
    this.leaveRoom(client, roomId);
  }

  @SubscribeMessage('webrtc_offer')
  handleWebRTCOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; targetUserId: string; offer: WebRTCOffer }
  ) {
    const { roomId, targetUserId, offer } = data;

    // Find target client
    const targetClient = this.findClientByUserId(targetUserId);
    if (targetClient) {
      targetClient.emit('webrtc_offer', {
        fromUserId: client.userId,
        fromSocketId: client.id,
        offer,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`WebRTC offer sent from ${client.userId} to ${targetUserId} in room ${roomId}`);
    } else {
      client.emit('webrtc_error', { message: 'Target user not found' });
    }
  }

  @SubscribeMessage('webrtc_answer')
  handleWebRTCAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; targetUserId: string; answer: WebRTCAnswer }
  ) {
    const { roomId, targetUserId, answer } = data;

    const targetClient = this.findClientByUserId(targetUserId);
    if (targetClient) {
      targetClient.emit('webrtc_answer', {
        fromUserId: client.userId,
        fromSocketId: client.id,
        answer,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`WebRTC answer sent from ${client.userId} to ${targetUserId} in room ${roomId}`);
    } else {
      client.emit('webrtc_error', { message: 'Target user not found' });
    }
  }

  @SubscribeMessage('webrtc_ice_candidate')
  handleWebRTCIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; targetUserId: string; candidate: WebRTCIceCandidate }
  ) {
    const { roomId, targetUserId, candidate } = data;

    const targetClient = this.findClientByUserId(targetUserId);
    if (targetClient) {
      targetClient.emit('webrtc_ice_candidate', {
        fromUserId: client.userId,
        fromSocketId: client.id,
        candidate,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`ICE candidate sent from ${client.userId} to ${targetUserId} in room ${roomId}`);
    }
  }

  @SubscribeMessage('participant_update')
  handleParticipantUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; update: ParticipantUpdate }
  ) {
    const { roomId, update } = data;

    // Broadcast to all participants in the room
    client.to(roomId).emit('participant_updated', {
      userId: client.userId,
      ...update,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Participant update from ${client.userId} in room ${roomId}:`, update);
  }

  @SubscribeMessage('chat_message')
  async handleChatMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; content: string; type?: string }
  ) {
    try {
      const { roomId, content, type = 'text' } = data;

      // Get meeting ID from room ID
      const meeting = await this.meetingsService.findByRoomId(roomId);

      // Save message to database
      const message = await this.meetingsService.sendMessage(meeting.id, client.userId!, {
        content,
        type,
      });

      // Broadcast to all participants
      this.server.to(roomId).emit('chat_message', {
        id: message.id,
        content: message.content,
        type: message.type,
        sender: {
          id: message.sender.id,
          displayName: message.sender.displayName,
          email: message.sender.email,
        },
        createdAt: message.createdAt,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Error sending chat message:`, error.message);
      client.emit('chat_error', { message: error.message });
    }
  }

  @SubscribeMessage('screen_share_start')
  handleScreenShareStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ) {
    const { roomId } = data;

    client.to(roomId).emit('screen_share_started', {
      userId: client.userId,
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Screen sharing started by ${client.userId} in room ${roomId}`);
  }

  @SubscribeMessage('screen_share_stop')
  handleScreenShareStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ) {
    const { roomId } = data;

    client.to(roomId).emit('screen_share_stopped', {
      userId: client.userId,
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Screen sharing stopped by ${client.userId} in room ${roomId}`);
  }

  private leaveRoom(client: AuthenticatedSocket, roomId: string) {
    client.leave(roomId);
    client.meetingRooms?.delete(roomId);

    // Remove from participants tracking
    this.roomParticipants.get(roomId)?.delete(client.id);
    if (this.roomParticipants.get(roomId)?.size === 0) {
      this.roomParticipants.delete(roomId);
    }

    // Notify other participants
    client.to(roomId).emit('participant_left', {
      userId: client.userId,
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`User ${client.userEmail} left meeting room: ${roomId}`);
  }

  private findClientByUserId(userId: string): AuthenticatedSocket | null {
    for (const client of this.connectedClients.values()) {
      if (client.userId === userId) {
        return client;
      }
    }
    return null;
  }

  private getRoomParticipants(roomId: string): Array<{ userId: string; userEmail: string; socketId: string }> {
    const participants: Array<{ userId: string; userEmail: string; socketId: string }> = [];
    const participantIds = this.roomParticipants.get(roomId) || new Set();

    for (const socketId of participantIds) {
      const client = this.connectedClients.get(socketId);
      if (client) {
        participants.push({
          userId: client.userId!,
          userEmail: client.userEmail!,
          socketId: client.id,
        });
      }
    }

    return participants;
  }

  // Public method to send notifications to meeting participants
  broadcastToMeeting(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}
