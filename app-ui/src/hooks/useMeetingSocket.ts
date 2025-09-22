'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  MeetingSocketEvents, 
  SocketParticipant, 
  WebRTCOffer, 
  WebRTCAnswer, 
  WebRTCIceCandidate, 
  ParticipantUpdate,
  MeetingMessage 
} from '@/types/meeting';

interface UseMeetingSocketOptions {
  enabled?: boolean;
  roomId?: string;
  onParticipantJoined?: (participant: { userId: string; userEmail: string; socketId: string }) => void;
  onParticipantLeft?: (participant: { userId: string; socketId: string }) => void;
  onParticipantUpdated?: (update: { userId: string } & ParticipantUpdate) => void;
  onWebRTCOffer?: (data: { fromUserId: string; fromSocketId: string; offer: WebRTCOffer }) => void;
  onWebRTCAnswer?: (data: { fromUserId: string; fromSocketId: string; answer: WebRTCAnswer }) => void;
  onWebRTCIceCandidate?: (data: { fromUserId: string; fromSocketId: string; candidate: WebRTCIceCandidate }) => void;
  onScreenShareStarted?: (data: { userId: string; socketId: string }) => void;
  onScreenShareStopped?: (data: { userId: string; socketId: string }) => void;
  onChatMessage?: (message: MeetingMessage) => void;
  onError?: (error: string) => void;
}

interface UseMeetingSocketReturn {
  socket: Socket | null;
  connected: boolean;
  participants: SocketParticipant[];
  joinMeeting: (roomId: string) => void;
  leaveMeeting: () => void;
  sendWebRTCOffer: (targetUserId: string, offer: WebRTCOffer) => void;
  sendWebRTCAnswer: (targetUserId: string, answer: WebRTCAnswer) => void;
  sendWebRTCIceCandidate: (targetUserId: string, candidate: WebRTCIceCandidate) => void;
  sendParticipantUpdate: (update: ParticipantUpdate) => void;
  sendChatMessage: (content: string, type?: string) => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useMeetingSocket = ({
  enabled = true,
  roomId,
  onParticipantJoined,
  onParticipantLeft,
  onParticipantUpdated,
  onWebRTCOffer,
  onWebRTCAnswer,
  onWebRTCIceCandidate,
  onScreenShareStarted,
  onScreenShareStopped,
  onChatMessage,
  onError,
}: UseMeetingSocketOptions = {}): UseMeetingSocketReturn => {
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<SocketParticipant[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn('No token available for meeting WebSocket connection');
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    socketRef.current = io(`${serverUrl}/meetings`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to meeting WebSocket');
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from meeting WebSocket:', reason);
      setConnected(false);
      setParticipants([]);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Meeting WebSocket connection error:', error);
      setConnected(false);
      onError?.('Meeting connection error');
    });

    // Authentication events
    socket.on('connected', (data) => {
      console.log('🎉 Meeting authentication successful:', data.message);
    });

    socket.on('auth_error', (data) => {
      console.error('🔐 Meeting authentication error:', data.message);
      onError?.(data.message);
    });

    // Meeting events
    socket.on('joined_meeting', (data) => {
      console.log('🏠 Joined meeting room:', data.roomId);
      currentRoomRef.current = data.roomId;
    });

    socket.on('room_participants', (data) => {
      console.log('👥 Current participants:', data.participants);
      setParticipants(data.participants);
    });

    socket.on('participant_joined', (data) => {
      console.log('👤 Participant joined:', data);
      setParticipants(prev => {
        const existing = prev.find(p => p.userId === data.userId);
        if (existing) return prev;
        return [...prev, { userId: data.userId, userEmail: data.userEmail, socketId: data.socketId }];
      });
      onParticipantJoined?.(data);
    });

    socket.on('participant_left', (data) => {
      console.log('👤 Participant left:', data);
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      onParticipantLeft?.(data);
    });

    socket.on('participant_updated', (data) => {
      console.log('👤 Participant updated:', data);
      onParticipantUpdated?.(data);
    });

    // WebRTC events
    socket.on('webrtc_offer', (data) => {
      console.log('📡 Received WebRTC offer from:', data.fromUserId);
      onWebRTCOffer?.(data);
    });

    socket.on('webrtc_answer', (data) => {
      console.log('📡 Received WebRTC answer from:', data.fromUserId);
      onWebRTCAnswer?.(data);
    });

    socket.on('webrtc_ice_candidate', (data) => {
      console.log('📡 Received ICE candidate from:', data.fromUserId);
      onWebRTCIceCandidate?.(data);
    });

    // Screen sharing events
    socket.on('screen_share_started', (data) => {
      console.log('🖥️ Screen sharing started by:', data.userId);
      onScreenShareStarted?.(data);
    });

    socket.on('screen_share_stopped', (data) => {
      console.log('🖥️ Screen sharing stopped by:', data.userId);
      onScreenShareStopped?.(data);
    });

    // Chat events
    socket.on('chat_message', (data) => {
      console.log('💬 Chat message received:', data);
      onChatMessage?.(data);
    });

    // Error events
    socket.on('meeting_error', (data) => {
      console.error('❌ Meeting error:', data.message);
      onError?.(data.message);
    });

    socket.on('webrtc_error', (data) => {
      console.error('❌ WebRTC error:', data.message);
      onError?.(data.message);
    });

    socket.on('chat_error', (data) => {
      console.error('❌ Chat error:', data.message);
      onError?.(data.message);
    });

  }, []); // ✅ CRITICAL FIX: Loại bỏ tất cả callback dependencies để tránh infinite loop

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setParticipants([]);
      currentRoomRef.current = null;
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      if (enabled && !socketRef.current?.connected) {
        connect();
      }
    }, 1000);
  }, []); // ✅ Loại bỏ dependencies

  const joinMeeting = useCallback((roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_meeting', { roomId });
    }
  }, []);

  const leaveMeeting = useCallback(() => {
    if (socketRef.current?.connected && currentRoomRef.current) {
      socketRef.current.emit('leave_meeting', { roomId: currentRoomRef.current });
      currentRoomRef.current = null;
    }
  }, []);

  const sendWebRTCOffer = useCallback((targetUserId: string, offer: WebRTCOffer) => {
    if (socketRef.current?.connected && currentRoomRef.current) {
      socketRef.current.emit('webrtc_offer', {
        roomId: currentRoomRef.current,
        targetUserId,
        offer,
      });
    }
  }, []);

  const sendWebRTCAnswer = useCallback((targetUserId: string, answer: WebRTCAnswer) => {
    if (socketRef.current?.connected && currentRoomRef.current) {
      socketRef.current.emit('webrtc_answer', {
        roomId: currentRoomRef.current,
        targetUserId,
        answer,
      });
    }
  }, []);

  const sendWebRTCIceCandidate = useCallback((targetUserId: string, candidate: WebRTCIceCandidate) => {
    if (socketRef.current?.connected && currentRoomRef.current) {
      socketRef.current.emit('webrtc_ice_candidate', {
        roomId: currentRoomRef.current,
        targetUserId,
        candidate,
      });
    }
  }, []);

  const sendParticipantUpdate = useCallback((update: ParticipantUpdate) => {
    if (socketRef.current?.connected && currentRoomRef.current) {
      socketRef.current.emit('participant_update', {
        roomId: currentRoomRef.current,
        update,
      });
    }
  }, []);

  const sendChatMessage = useCallback((content: string, type = 'text') => {
    if (socketRef.current?.connected && currentRoomRef.current) {
      socketRef.current.emit('chat_message', {
        roomId: currentRoomRef.current,
        content,
        type,
      });
    }
  }, []);

  const startScreenShare = useCallback(() => {
    if (socketRef.current?.connected && currentRoomRef.current) {
      socketRef.current.emit('screen_share_start', {
        roomId: currentRoomRef.current,
      });
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (socketRef.current?.connected && currentRoomRef.current) {
      socketRef.current.emit('screen_share_stop', {
        roomId: currentRoomRef.current,
      });
    }
  }, []);

  // Initialize connection
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Auto join room if roomId is provided
  useEffect(() => {
    if (connected && roomId && roomId !== currentRoomRef.current) {
      joinMeeting(roomId);
    }
  }, [connected, roomId, joinMeeting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    connected,
    participants,
    joinMeeting,
    leaveMeeting,
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendWebRTCIceCandidate,
    sendParticipantUpdate,
    sendChatMessage,
    startScreenShare,
    stopScreenShare,
    disconnect,
    reconnect,
  };
};
