'use client';

import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SystemCharts from '@/components/dashboard/SystemCharts';
import ActivityLogs from '@/components/dashboard/ActivityLogs';
// ActivityDebug component (có thể xóa nếu không cần)
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const { user, permissions } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [showDebug, setShowDebug] = React.useState(false);

  // Toggle debug panel with Ctrl+Shift+D
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Title level={2}>Bảng điều khiển</Title>
        <Paragraph>
          Chào mừng <strong>{user?.displayName}</strong>! Đây là tổng quan hệ thống của bạn.
        </Paragraph>
      </div>

      {/* Biểu đồ hệ thống */}
      <div style={{ marginBottom: 12 }}>
        <SystemCharts
          key={refreshKey}
          onViewUsers={() => router.push('/dashboard/users')}
          onViewGroups={() => router.push('/dashboard/groups')}
        />
      </div>

      {/* Thống kê cá nhân */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Quyền của bạn"
              value={permissions.length}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Trạng thái tài khoản"
              value={user?.isActive ? "Hoạt động" : "Không hoạt động"}
              valueStyle={{ color: user?.isActive ? '#3f8600' : '#cf1322' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Quyền truy cập"
              value={permissions.includes('system.manage') ? "Quản trị viên" : "Người dùng"}
              valueStyle={{ color: permissions.includes('system.manage') ? '#1890ff' : '#52c41a' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Phương thức đăng nhập"
              value="Email"
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Activity Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 12,padding:12 }}>
        <Col xs={24} lg={12}>
          <ActivityLogs
            height={450}
            limit={8}
            showHeader={true}
          />
        </Col>
        <Col xs={24} lg={12}>
        
        </Col>
      </Row>

      {/* Chi tiết quyền */}
      <Card title="Quyền của bạn" style={{ marginBottom: 24 }}>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {permissions.length > 0 ? (
            <ul>
              {permissions.map(permission => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
          ) : (
            <Paragraph type="secondary">Chưa có quyền nào được gán</Paragraph>
          )}
        </div>
      </Card>

      {/* Debug Panel - Disabled */}
      {/* <ActivityDebug show={showDebug} /> */}
    </div>
  );
};

export default Dashboard;
