'use client';

import React, { useState, useEffect } from 'react';
import {
  Timeline,
  Typography,
  Avatar,
  Space,
  Spin,
  Empty,
  Tag,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  LoginOutlined,
  LogoutOutlined,
  EyeOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  MenuOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { ActivityLog as ActivityLogType } from '@/types/dashboard';

const { Text } = Typography;

interface ActivityLogProps {
  userId?: string;
  limit?: number;
  showUser?: boolean;
  height?: number;
  activities?: ActivityLogType[];
  loading?: boolean;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ 
  userId, 
  limit = 10, 
  showUser = true, 
  height,
  activities: externalActivities,
  loading: externalLoading
}) => {
  const [activities, setActivities] = useState<ActivityLogType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (externalActivities) {
      setActivities(externalActivities);
      return;
    }

    fetchActivities();
  }, [userId, limit, externalActivities]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let response;
      
      if (userId) {
        response = await apiClient.getUserActivityLogs(userId, { limit });
        setActivities(response.data || []);
      } else {
        response = await apiClient.getRecentActivities(limit);
        setActivities(response || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string, resource: string) => {
    const iconStyle = { fontSize: '14px' };
    
    switch (action) {
      case 'login':
        return <LoginOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
      case 'logout':
        return <LogoutOutlined style={{ ...iconStyle, color: '#faad14' }} />;
      case 'create':
        return <CheckCircleOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
      case 'update':
        return <EditOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
      case 'delete':
        return <DeleteOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
      case 'view':
        return <EyeOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
      case 'assign':
      case 'unassign':
        return <SafetyCertificateOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
      default:
        // Icon based on resource
        switch (resource) {
          case 'user':
            return <UserOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
          case 'group':
            return <TeamOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
          case 'permission':
            return <SafetyCertificateOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
          case 'menu':
            return <MenuOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
          default:
            return <SettingOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
        }
    }
  };

  const getActionDescription = (activity: ActivityLogType): string => {
    const { action, resource, details } = activity;
    
    const actionMap: Record<string, string> = {
      login: 'đăng nhập hệ thống',
      logout: 'đăng xuất khỏi hệ thống',
      create: 'tạo mới',
      update: 'cập nhật',
      delete: 'xóa',
      view: 'xem',
      assign: 'gán quyền cho',
      unassign: 'bỏ quyền khỏi',
    };

    const resourceMap: Record<string, string> = {
      user: 'người dùng',
      group: 'nhóm',
      permission: 'quyền',
      menu: 'menu',
      profile: 'thông tin cá nhân',
      system: 'hệ thống',
    };

    const actionText = actionMap[action] || action;
    const resourceText = resourceMap[resource] || resource;

    if (action === 'login' || action === 'logout') {
      return actionText;
    }

    return `${actionText} ${resourceText}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      default:
        return '#8c8c8c';
    }
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
  };

  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Empty 
        description="Không có hoạt động nào"
        style={{ padding: '20px' }}
      />
    );
  }

  return (
    <div style={{ height, overflowY: height ? 'auto' : 'visible' }}>
      <Timeline>
        {activities.map((activity) => (
          <Timeline.Item 
            key={activity.id} 
            dot={
              <Avatar 
                size="small" 
                icon={getActivityIcon(activity.action, activity.resource)}
                style={{ backgroundColor: 'transparent' }}
              />
            }
          >
            <div>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <div>
                  {showUser && activity.user && (
                    <Text strong style={{ marginRight: 8 }}>
                      {activity.user.displayName}
                    </Text>
                  )}
                  <Text>{getActionDescription(activity)}</Text>
                  <Tag 
                    color={getStatusColor(activity.status)} 
                    style={{ marginLeft: 8, fontSize: '12px', padding: '0 6px' }}
                  >
                    {activity.status}
                  </Tag>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {formatRelativeTime(activity.createdAt)}
                  </Text>
                  {activity.ipAddress && (
                    <Tooltip title={`IP: ${activity.ipAddress}`}>
                      <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
                        • {activity.ipAddress}
                      </Text>
                    </Tooltip>
                  )}
                </div>
              </Space>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default ActivityLog;
