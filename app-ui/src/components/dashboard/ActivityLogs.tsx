'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Typography, 
  Tag, 
  Space, 
  Button,
  Skeleton,
  Empty,
  Tooltip,
  Badge,
} from 'antd';
import { 
  UserOutlined, 
  ReloadOutlined,
  WifiOutlined,
  DisconnectOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

const { Text } = Typography;

interface ActivityLog {
  id: string;
  user: {
    id: string;
    displayName: string;
    email: string;
  } | null;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  method?: string;
  path?: string;
  status: 'success' | 'error';
  createdAt: string;
}

interface ActivityLogsProps {
  height?: number;
  limit?: number;
  showHeader?: boolean;
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({
  height = 380,
  limit = 10,
  showHeader = true,
}) => {
  const { getToken } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // Use ref to prevent re-creating socket on every render
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(true);

  // Kết nối Socket.IO - chỉ tạo 1 lần
  const connectSocket = useCallback(async () => {
    // Prevent multiple connections
    if (socketRef.current?.connected) {
      console.log('🔌 Socket already connected, skipping...');
      return;
    }

    // Disconnect existing socket first
    if (socketRef.current) {
      console.log('🔌 Disconnecting existing socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('❌ No token available for socket connection');
        setLoading(false);
        return;
      }

      console.log('🔌 Creating new Socket.IO connection...');

      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/activities`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true, // Force new connection
      });

      // Connection events
      newSocket.on('connect', () => {
        if (!mountedRef.current) return;
        console.log('✅ Socket connected:', newSocket.id);
        setConnected(true);
        setLoading(false);

        // Request recent activities
        newSocket.emit('get_recent_activities', { limit });
      });

      newSocket.on('disconnect', () => {
        if (!mountedRef.current) return;
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        if (!mountedRef.current) return;
        console.error('🔴 Socket connection error:', error);
        setConnected(false);
        setLoading(false);
      });

      // Activity events
      newSocket.on('recent_activities', (data: ActivityLog[]) => {
        if (!mountedRef.current) return;
        // console.log('📋 Received recent activities:', data.length);
        setActivities(data);
        setLoading(false);
      });

      newSocket.on('new_activity', (activity: ActivityLog) => {
        if (!mountedRef.current) return;
        // console.log('🆕 New activity:', activity);
        setActivities(prev => [activity, ...prev.slice(0, limit - 1)]);
      });

      newSocket.on('error', (error) => {
        if (!mountedRef.current) return;
        console.error('🔴 Socket error:', error);
      });

      socketRef.current = newSocket;

    } catch (error) {
      console.error('❌ Failed to connect socket:', error);
      setLoading(false);
    }
  }, [getToken, limit]);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🔄 Manual refresh...');
      setLoading(true);
      socketRef.current.emit('get_recent_activities', { limit });
    } else {
      console.log('🔄 Reconnecting...');
      connectSocket();
    }
  }, [limit, connectSocket]);

  // Initialize connection - chỉ chạy 1 lần
  useEffect(() => {
    mountedRef.current = true;
    connectSocket();

    return () => {
      console.log('🧹 Component unmounting, cleaning up socket...');
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array - chỉ chạy 1 lần

  // Render activity item
  const renderActivityItem = (activity: ActivityLog) => {
    const getActionColor = (action: string, status: string) => {
      if (status === 'error') return 'red';
      switch (action.toLowerCase()) {
        case 'create': return 'green';
        case 'update': return 'blue';
        case 'delete': return 'red';
        case 'login': return 'cyan';
        case 'logout': return 'orange';
        default: return 'default';
      }
    };

    const getActionText = (action: string) => {
      const actionMap: Record<string, string> = {
        'create': 'Tạo',
        'update': 'Cập nhật',
        'delete': 'Xóa',
        'login': 'Đăng nhập',
        'logout': 'Đăng xuất',
        'view': 'Xem',
        'get': 'Truy cập',
        'post': 'Tạo',
        'put': 'Cập nhật',
        'patch': 'Sửa',
      };
      return actionMap[action.toLowerCase()] || action;
    };

    const getResourceText = (resource: string) => {
      const resourceMap: Record<string, string> = {
        'users': 'Người dùng',
        'groups': 'Nhóm',
        'permissions': 'Quyền',
        'menus': 'Menu',
        'auth': 'Xác thực',
        'dashboard': 'Dashboard',
        'activity-logs': 'Nhật ký',
      };
      return resourceMap[resource.toLowerCase()] || resource;
    };

    return (
      <List.Item key={activity.id}>
        <List.Item.Meta
          avatar={
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: activity.status === 'error' ? '#ff4d4f' : '#1890ff' 
              }}
            />
          }
          title={
            <Space>
              <Text strong>
                {activity.user?.displayName || 'Hệ thống'}
              </Text>
              <Tag color={getActionColor(activity.action, activity.status)}>
                {getActionText(activity.action)}
              </Tag>
              <Text type="secondary">
                {getResourceText(activity.resource)}
              </Text>
            </Space>
          }
          description={
            <Space direction="vertical" size={4}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {activity.path} • {activity.method}
              </Text>
              <Space>
                <ClockCircleOutlined style={{ fontSize: '12px' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatDistanceToNow(new Date(activity.createdAt), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </Text>
              </Space>
            </Space>
          }
        />
      </List.Item>
    );
  };

  const cardTitle = (
    <Space>
      <Text strong>Hoạt động hệ thống</Text>
      <Badge 
        status={connected ? 'success' : 'error'} 
        text={connected ? 'Kết nối' : 'Mất kết nối'}
      />
    </Space>
  );

  const cardExtra = showHeader ? (
    <Space>
      <Tooltip title={connected ? 'Kết nối' : 'Mất kết nối'}>
        {connected ? (
          <WifiOutlined style={{ color: '#52c41a' }} />
        ) : (
          <DisconnectOutlined style={{ color: '#ff4d4f' }} />
        )}
      </Tooltip>
      <Button
        type="text"
        icon={<ReloadOutlined />}
        onClick={handleRefresh}
        loading={loading}
        size="small"
        disabled={!socketRef.current}
      >
        Làm mới
      </Button>
    </Space>
  ) : undefined;

  return (
    <Card 
      title={showHeader ? cardTitle : undefined}
      extra={cardExtra}
      style={{ height }}
      styles={{ body: { padding: '12px' } }}
    >
      <div style={{ 
        height: showHeader ? height - 57 : height - 16,
        overflow: 'auto'
      }}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : activities.length === 0 ? (
          <Empty 
            description="Chưa có hoạt động nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={activities}
            renderItem={renderActivityItem}
            size="small"
            split={false}
          />
        )}
      </div>
    </Card>
  );
};

export default ActivityLogs;
