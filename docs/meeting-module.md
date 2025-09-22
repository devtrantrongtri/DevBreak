# Meeting Module - DevBreak

## Tổng quan

Meeting Module là một hệ thống video calling và collaboration được tích hợp vào DevBreak, sử dụng WebRTC để cung cấp khả năng gọi video peer-to-peer chất lượng cao.

## Tính năng chính

### 🎥 Video Calling
- **WebRTC P2P**: Kết nối trực tiếp giữa các participants
- **HD Video**: Hỗ trợ video 720p/1080p với 30fps
- **Audio**: Echo cancellation, noise suppression, auto gain control
- **Screen Sharing**: Chia sẻ màn hình với audio
- **Camera/Mic Controls**: Bật/tắt camera và microphone

### 💬 Real-time Chat
- **Text Messages**: Tin nhắn text trong meeting
- **Message History**: Lưu trữ lịch sử chat
- **Reply Support**: Trả lời tin nhắn
- **System Messages**: Thông báo hệ thống

### 👥 Participant Management
- **Roles**: Host, Co-host, Participant, Viewer
- **Permissions**: Quản lý quyền speak, chat, video
- **Mute Controls**: Host có thể mute/unmute participants
- **Remove Participants**: Host có thể remove participants

### 📅 Meeting Management
- **Scheduled Meetings**: Lên lịch meeting với thời gian
- **Instant Meetings**: Tạo meeting ngay lập tức
- **Project Integration**: Liên kết meeting với project
- **Room ID**: Mã phòng dễ nhớ để tham gia

## Kiến trúc

### Backend (NestJS)

#### Entities
```typescript
// Meeting: Thông tin meeting chính
Meeting {
  id: string
  title: string
  roomId: string (unique)
  status: 'scheduled' | 'active' | 'ended' | 'cancelled'
  hostId: string
  projectId?: string
  settings: JSON
}

// MeetingParticipant: Thông tin participants
MeetingParticipant {
  id: string
  meetingId: string
  userId: string
  role: 'host' | 'co-host' | 'participant' | 'viewer'
  status: 'invited' | 'joined' | 'left' | 'removed'
  permissions: JSON
}

// MeetingMessage: Chat messages
MeetingMessage {
  id: string
  meetingId: string
  senderId: string
  content: string
  type: 'text' | 'file' | 'system'
}
```

#### APIs
```typescript
// Meeting CRUD
POST   /meetings                    // Tạo meeting
GET    /meetings                    // Lấy danh sách meetings
GET    /meetings/:id                // Chi tiết meeting
GET    /meetings/room/:roomId       // Tìm meeting theo roomId
PATCH  /meetings/:id                // Cập nhật meeting
DELETE /meetings/:id                // Xóa meeting

// Meeting Actions
POST   /meetings/join/:roomId       // Tham gia meeting
POST   /meetings/leave/:roomId      // Rời meeting

// Participant Management
PATCH  /meetings/:id/participants/:participantId  // Cập nhật participant

// Chat
POST   /meetings/:id/messages       // Gửi message
GET    /meetings/:id/messages       // Lấy messages
```

#### WebSocket Events
```typescript
// Connection
'join_meeting' -> { roomId }
'leave_meeting' -> { roomId }

// WebRTC Signaling
'webrtc_offer' -> { targetUserId, offer }
'webrtc_answer' -> { targetUserId, answer }
'webrtc_ice_candidate' -> { targetUserId, candidate }

// Participant Updates
'participant_update' -> { isVideoEnabled, isAudioEnabled, ... }

// Chat
'chat_message' -> { content, type }

// Screen Sharing
'screen_share_start' -> { roomId }
'screen_share_stop' -> { roomId }
```

### Frontend (Next.js + React)

#### Components
```
components/meetings/
├── MeetingRoom.tsx          // Main meeting interface
├── VideoPlayer.tsx          // Video stream player
├── MeetingChat.tsx          // Chat component
├── ParticipantsList.tsx     // Participants management
└── MeetingsList.tsx         // Meetings list & create
```

#### Hooks
```typescript
// useMeetingSocket: WebSocket connection & events
const {
  connected,
  participants,
  joinMeeting,
  sendWebRTCOffer,
  sendChatMessage,
  ...
} = useMeetingSocket({ roomId });

// useWebRTC: WebRTC peer connection
const {
  localStream,
  remoteStream,
  isVideoEnabled,
  toggleVideo,
  startScreenShare,
  createOffer,
  ...
} = useWebRTC();
```

#### Pages
```
app/(dashboard)/meetings/
├── page.tsx                 // Meetings list
└── room/[roomId]/page.tsx   // Meeting room
```

## WebRTC Flow

### 1. Join Meeting
```
1. User joins meeting room via WebSocket
2. Start local camera/microphone stream
3. Create RTCPeerConnection with STUN servers
4. Add local tracks to peer connection
```

### 2. Peer Connection
```
1. When new participant joins:
   - Create WebRTC offer
   - Send offer via WebSocket
   
2. Receiving participant:
   - Receive offer
   - Create answer
   - Send answer back
   
3. ICE Candidate Exchange:
   - Exchange ICE candidates for NAT traversal
   - Establish direct P2P connection
```

### 3. Media Streams
```
1. Local Stream: Camera + Microphone
2. Remote Stream: From other participants
3. Screen Share: Replace video track with screen capture
4. Audio/Video Controls: Enable/disable tracks
```

## Permissions

### Meeting Permissions
```
meetings              // Access to meetings module
├── meetings.view     // View meetings and participants
├── meetings.create   // Create new meetings
├── meetings.update   // Update meeting details
├── meetings.delete   // Delete meetings
├── meetings.join     // Join and leave meetings
├── meetings.manage   // Manage participants and settings
└── meetings.chat     // Send and view chat messages
```

### Role-based Access
- **Host**: Full control over meeting
- **Co-host**: Can manage participants, mute/unmute
- **Participant**: Can speak, chat, share video
- **Viewer**: Can only view, limited interaction

## Cài đặt & Deployment

### Dependencies

#### Backend
```json
{
  "@nestjs/websockets": "^10.0.0",
  "@nestjs/platform-socket.io": "^10.0.0",
  "socket.io": "^4.7.0",
  "uuid": "^9.0.0"
}
```

#### Frontend
```json
{
  "socket.io-client": "^4.7.0",
  "dayjs": "^1.11.0"
}
```

### Environment Variables
```env
# WebSocket CORS
CLIENT_URL=http://localhost:3001

# STUN/TURN Servers (optional)
STUN_SERVER=stun:stun.l.google.com:19302
```

### Database Migration
```bash
# Entities sẽ tự động tạo tables khi chạy app
# Meeting, MeetingParticipant, MeetingMessage
```

## Sử dụng

### 1. Tạo Meeting
```typescript
const meeting = await apiClient.createMeeting({
  title: "Daily Standup",
  description: "Team daily meeting",
  projectId: "project-123",
  startTime: "2024-01-01T09:00:00Z",
  isVideoEnabled: true,
  isAudioEnabled: true,
  isChatEnabled: true
});
```

### 2. Tham gia Meeting
```typescript
// Tham gia qua Room ID
await apiClient.joinMeeting(roomId, {
  isVideoEnabled: true,
  isAudioEnabled: true
});

// Navigate to meeting room
router.push(`/meetings/room/${roomId}`);
```

### 3. WebSocket Integration
```typescript
const socket = useMeetingSocket({
  roomId: "abc123",
  onParticipantJoined: (participant) => {
    console.log(`${participant.userEmail} joined`);
  },
  onWebRTCOffer: async (data) => {
    const answer = await createAnswer(data.offer);
    sendWebRTCAnswer(data.fromUserId, answer);
  }
});
```

## Troubleshooting

### Common Issues

#### 1. WebRTC Connection Failed
```
- Check STUN server configuration
- Verify firewall/NAT settings
- Consider using TURN server for corporate networks
```

#### 2. Audio/Video Not Working
```
- Check browser permissions for camera/microphone
- Verify HTTPS connection (required for getUserMedia)
- Test with different browsers
```

#### 3. Socket Connection Issues
```
- Verify JWT token is valid
- Check CORS configuration
- Ensure WebSocket endpoint is accessible
```

### Browser Support
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14.3+)
- **Edge**: Full support

### Performance Tips
- Limit participants to 4-6 for optimal performance
- Use screen sharing sparingly
- Monitor bandwidth usage
- Consider video quality settings based on network

## Roadmap

### Phase 1 ✅ (Completed)
- [x] Basic video calling (1-on-1)
- [x] Audio controls
- [x] Screen sharing
- [x] Text chat
- [x] Meeting management

### Phase 2 (Future)
- [ ] Multi-party calling (3+ participants)
- [ ] Recording functionality
- [ ] File sharing in chat
- [ ] Meeting templates
- [ ] Calendar integration

### Phase 3 (Future)
- [ ] Mobile app support
- [ ] Advanced moderation tools
- [ ] Breakout rooms
- [ ] Virtual backgrounds
- [ ] Meeting analytics

## Support

Để được hỗ trợ về Meeting Module:
1. Kiểm tra logs trong browser console
2. Xem server logs cho WebSocket errors
3. Verify permissions và network connectivity
4. Test với simple WebRTC samples trước

---

**Meeting Module** là một phần quan trọng của DevBreak ecosystem, cung cấp khả năng collaboration realtime cho teams. Với WebRTC P2P architecture, module đảm bảo chất lượng video/audio cao và độ trễ thấp.
