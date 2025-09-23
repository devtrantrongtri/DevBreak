export interface User {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'PM' | 'BC' | 'DEV' | 'QC';
  joinedAt: string;
  user?: User;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  roomId: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  startTime?: string;
  endTime?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  hostId: string;
  projectId?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isChatEnabled: boolean;
  isRecording: boolean;
  maxParticipants?: number;
  allowRecording?: boolean;
  isRecurring?: boolean;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  host: User;
  project?: Project;
  participants: MeetingParticipant[];
  messages?: MeetingMessage[];
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  status: 'invited' | 'joined' | 'left' | 'removed';
  role: 'host' | 'co-host' | 'participant' | 'viewer';
  joinedAt?: string;
  leftAt?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isMuted: boolean;
  canSpeak: boolean;
  canChat: boolean;
  connectionInfo?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user: User;
}

export interface MeetingMessage {
  id: string;
  meetingId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system' | 'reaction';
  metadata?: Record<string, any>;
  isEdited: boolean;
  isDeleted: boolean;
  replyToId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  sender: User;
  replyTo?: MeetingMessage;
}

export interface CreateMeetingDto {
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  projectId?: string;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isChatEnabled?: boolean;
  maxParticipants?: number;
  allowRecording?: boolean;
  isRecurring?: boolean;
  participantIds?: string[];
  settings?: Record<string, any>;
}

export interface UpdateMeetingDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'active' | 'ended' | 'cancelled';
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isChatEnabled?: boolean;
  isRecording?: boolean;
  settings?: Record<string, any>;
}

export interface JoinMeetingDto {
  roomId: string;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
}

export interface UpdateParticipantDto {
  role?: 'host' | 'co-host' | 'participant' | 'viewer';
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isMuted?: boolean;
  canSpeak?: boolean;
  canChat?: boolean;
}

export interface SendMessageDto {
  content: string;
  type?: 'text' | 'file' | 'image' | 'system' | 'reaction';
  metadata?: Record<string, any>;
  replyToId?: string;
}

// WebRTC interfaces
export interface WebRTCOffer {
  type: 'offer';
  sdp: string;
}

export interface WebRTCAnswer {
  type: 'answer';
  sdp: string;
}

export interface WebRTCIceCandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

export interface ParticipantUpdate {
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isScreenSharing?: boolean;
  isMuted?: boolean;
}

// Socket events
export interface SocketParticipant {
  userId: string;
  userEmail: string;
  socketId: string;
}

export interface MeetingSocketEvents {
  // Connection events
  connected: { message: string; userId: string; timestamp: string };
  joined_meeting: { roomId: string; message: string; timestamp: string };
  room_participants: { participants: SocketParticipant[]; timestamp: string };
  
  // Participant events
  participant_joined: { userId: string; userEmail: string; socketId: string; timestamp: string };
  participant_left: { userId: string; socketId: string; timestamp: string };
  participant_updated: { userId: string } & ParticipantUpdate & { timestamp: string };
  
  // WebRTC events
  webrtc_offer: { fromUserId: string; fromSocketId: string; offer: WebRTCOffer; timestamp: string };
  webrtc_answer: { fromUserId: string; fromSocketId: string; answer: WebRTCAnswer; timestamp: string };
  webrtc_ice_candidate: { fromUserId: string; fromSocketId: string; candidate: WebRTCIceCandidate; timestamp: string };
  
  // Screen sharing events
  screen_share_started: { userId: string; socketId: string; timestamp: string };
  screen_share_stopped: { userId: string; socketId: string; timestamp: string };
  
  // Chat events
  chat_message: MeetingMessage & { timestamp: string };
  
  // Error events
  auth_error: { message: string };
  meeting_error: { message: string };
  webrtc_error: { message: string };
  chat_error: { message: string };
}
