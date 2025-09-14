'use client';

import React from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Statistic,
  Avatar,
} from 'antd';
import {
  UserAddOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface QuickActionsProps {
  userCount?: number;
  groupCount?: number;
  onRefresh?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  userCount = 0, 
  groupCount = 0, 
  onRefresh 
}) => {
  const router = useRouter();
  const { permissions } = useAuth();
  const { t } = useTranslation();

  const canCreateUser = permissions.includes('user.create');
  const canCreateGroup = permissions.includes('group.create');
  const canManageSystem = permissions.includes('system.manage');

  const quickActions = [
    {
      title: 'Tạo người dùng mới',
      description: 'Thêm người dùng mới vào hệ thống',
      icon: <UserAddOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      action: () => router.push('/dashboard/users/create'),
      enabled: canCreateUser,
      color: '#1890ff',
    },
    {
      title: 'Tạo nhóm mới',
      description: 'Tạo nhóm quyền mới',
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      action: () => router.push('/dashboard/groups/create'),
      enabled: canCreateGroup,
      color: '#52c41a',
    },
    {
      title: 'Quản lý người dùng',
      description: 'Xem và quản lý tất cả người dùng',
      icon: <SettingOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      action: () => router.push('/dashboard/users'),
      enabled: true,
      color: '#722ed1',
    },
    {
      title: 'Quản lý nhóm',
      description: 'Xem và quản lý các nhóm quyền',
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      action: () => router.push('/dashboard/groups'),
      enabled: true,
      color: '#fa8c16',
    },
    {
      title: 'Nhập dữ liệu',
      description: 'Nhập người dùng từ file CSV',
      icon: <UploadOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />,
      action: () => router.push('/dashboard/users?import=true'),
      enabled: canCreateUser,
      color: '#13c2c2',
    },
    {
      title: 'Xuất báo cáo',
      description: 'Xuất danh sách người dùng và nhóm',
      icon: <DownloadOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
      action: () => router.push('/dashboard/users?export=true'),
      enabled: true,
      color: '#eb2f96',
    },
  ];

  const systemStats = [
    {
      title: 'Tổng người dùng',
      value: userCount,
      icon: <UserAddOutlined />,
      color: '#1890ff',
      action: () => router.push('/dashboard/users'),
    },
    {
      title: 'Tổng nhóm',
      value: groupCount,
      icon: <TeamOutlined />,
      color: '#52c41a',
      action: () => router.push('/dashboard/groups'),
    },
    {
      title: 'Người dùng hoạt động',
      value: Math.floor(userCount * 0.8), // Mock active users
      icon: <UserAddOutlined />,
      color: '#fa8c16',
      action: () => router.push('/dashboard/users?status=active'),
    },
  ];

  return (
    <div>
      {/* System Overview */}
      <Card 
        title="Tổng quan hệ thống" 
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRefresh}
            size="small"
          >
            Làm mới
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          {systemStats.map((stat, index) => (
            <Col xs={24} sm={8} key={index}>
              <Card 
                size="small" 
                hoverable
                onClick={stat.action}
                style={{ 
                  cursor: 'pointer',
                  borderLeft: `4px solid ${stat.color}`,
                }}
              >
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={
                    <Avatar 
                      icon={stat.icon} 
                      style={{ 
                        backgroundColor: stat.color,
                        marginRight: 8,
                      }}
                      size="small"
                    />
                  }
                  valueStyle={{ color: stat.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh">
        <Row gutter={[16, 16]}>
          {quickActions
            .filter(action => action.enabled)
            .map((action, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card 
                size="small" 
                hoverable
                onClick={action.action}
                style={{ 
                  cursor: 'pointer',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  {action.icon}
                </div>
                <Title level={5} style={{ margin: '8px 0 4px 0', color: action.color }}>
                  {action.title}
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {action.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Actions */}
      <Card title="Gợi ý hành động" style={{ marginTop: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ 
            padding: '12px', 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f',
            borderRadius: '6px',
          }}>
            <Space>
              <PlusOutlined style={{ color: '#52c41a' }} />
              <div>
                <Text strong>Bắt đầu nhanh</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Tạo người dùng đầu tiên và gán quyền phù hợp
                </Text>
              </div>
              <Button 
                type="primary" 
                size="small"
                onClick={() => router.push('/dashboard/users/create')}
                disabled={!canCreateUser}
              >
                Tạo ngay
              </Button>
            </Space>
          </div>

          <div style={{ 
            padding: '12px', 
            background: '#fff7e6', 
            border: '1px solid #ffd591',
            borderRadius: '6px',
          }}>
            <Space>
              <TeamOutlined style={{ color: '#fa8c16' }} />
              <div>
                <Text strong>Tổ chức quyền hạn</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Tạo các nhóm quyền để quản lý dễ dàng hơn
                </Text>
              </div>
              <Button 
                size="small"
                onClick={() => router.push('/dashboard/groups')}
              >
                Xem nhóm
              </Button>
            </Space>
          </div>

          <div style={{ 
            padding: '12px', 
            background: '#f0f5ff', 
            border: '1px solid #adc6ff',
            borderRadius: '6px',
          }}>
            <Space>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <div>
                <Text strong>Nhập dữ liệu hàng loạt</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Sử dụng file CSV để nhập nhiều người dùng cùng lúc
                </Text>
              </div>
              <Button 
                size="small"
                onClick={() => router.push('/dashboard/users?tab=import')}
                disabled={!canCreateUser}
              >
                Nhập dữ liệu
              </Button>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default QuickActions;
