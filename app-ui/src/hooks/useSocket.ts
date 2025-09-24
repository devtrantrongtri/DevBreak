'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { message } from 'antd';
import { ActivityLog } from '@/types/dashboard';

interface SystemNotification {
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

interface UseSocketOptions {
  enabled?: boolean;
  onNewActivity?: (activity: ActivityLog) => void;
  onRecentActivities?: (activities: ActivityLog[]) => void;
  onSystemNotification?: (notification: SystemNotification) => void;
  onError?: (error: string) => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  getRecentActivities: (limit?: number) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useSocket = ({
  enabled = true,
  onNewActivity,
  onRecentActivities,
  onSystemNotification,
  onError,
}: UseSocketOptions = {}): UseSocketReturn => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastConnectAttempt = useRef<number>(0);
  const CONNECTION_DEBOUNCE_MS = 1000; // 1 giây debounce

  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }, []);

  const connect = useCallback(() => {
    // Debounce connection attempts
    const now = Date.now();
    if (now - lastConnectAttempt.current < CONNECTION_DEBOUNCE_MS) {
      return;
    }
    lastConnectAttempt.current = now;

    if (socketRef.current?.connected) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn('Không có token để kết nối WebSocket');
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    socketRef.current = io(`${serverUrl}/activities`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 3, // Giảm từ 5 xuống 3
      reconnectionDelay: 2000, // Tăng từ 1s lên 2s
      reconnectionDelayMax: 10000, // Max 10s
      randomizationFactor: 0.5, // Random delay để tránh thundering herd
      forceNew: false, // Tái sử dụng connection
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Đã kết nối WebSocket');
      setConnected(true);
      message.success('Kết nối realtime thành công');
      
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Ngắt kết nối WebSocket:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server ngắt kết nối, cần reconnect thủ công
        reconnectTimeoutRef.current = setTimeout(() => {
          socket.connect();
        }, 2000);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Lỗi kết nối WebSocket:', error);
      setConnected(false);
      onError?.('Lỗi kết nối realtime');
    });

    // Authentication events
    socket.on('connected', (data) => {
      console.log('🎉 Xác thực thành công:', data.message);
    });

    socket.on('auth_error', (data) => {
      console.error('🔐 Lỗi xác thực:', data.message);
      message.error('Lỗi xác thực realtime');
      onError?.(data.message);
    });

    // Activity events
    socket.on('new_activity', (activity: ActivityLog) => {
      console.log('📝 Hoạt động mới:', activity);
      onNewActivity?.(activity);
    });

    socket.on('user_activity', (activity: ActivityLog) => {
      console.log('👤 Hoạt động cá nhân:', activity);
      onNewActivity?.(activity);
    });

    socket.on('recent_activities', (activities: ActivityLog[]) => {
      console.log('📋 Nhận được recent activities:', activities?.length || 0);
      onRecentActivities?.(activities); // Use correct callback
    });

    socket.on('recent_activities', (activities: ActivityLog[]) => {
      console.log('📋 Hoạt động gần đây:', activities.length, 'mục');
      activities.forEach(activity => onNewActivity?.(activity));
    });

    // System events
    socket.on('system_notification', (notification) => {
      console.log('🔔 Thông báo hệ thống:', notification);
      onSystemNotification?.(notification);
      
      // Hiển thị thông báo
      switch (notification.type) {
        case 'success':
          message.success(notification.message);
          break;
        case 'warning':
          message.warning(notification.message);
          break;
        case 'error':
          message.error(notification.message);
          break;
        default:
          message.info(notification.message);
      }
    });

    // Room events
    socket.on('joined_room', (data) => {
      console.log('🏠 Đã tham gia phòng:', data.room);
    });

    socket.on('left_room', (data) => {
      console.log('🚪 Đã rời phòng:', data.room);
    });

    // Error handling
    socket.on('error', (data) => {
      console.error('❌ Lỗi socket:', data.message);
      message.error(data.message);
      onError?.(data.message);
    });

  }, [getToken, onNewActivity, onRecentActivities, onSystemNotification, onError]);

  const disconnect = useCallback(() => {
    // Clear all timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners(); // Remove all listeners
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', { room });
    }
  }, []);

  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_room', { room });
    }
  }, []);

  const getRecentActivities = useCallback((limit = 10) => {
    console.log('🔌 getRecentActivities called:', { connected: socketRef.current?.connected, limit });
    if (socketRef.current?.connected) {
      console.log('📡 Emitting get_recent_activities...');
      socketRef.current.emit('get_recent_activities', { limit });
    } else {
      console.log('❌ Socket not connected, cannot get activities');
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    connected,
    joinRoom,
    leaveRoom,
    getRecentActivities,
    disconnect,
    reconnect,
  };
};
