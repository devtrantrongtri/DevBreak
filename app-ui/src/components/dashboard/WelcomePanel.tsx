import React from 'react';
import { Card, Typography, Row, Col, Avatar, Button, Space, Divider, List, Tag } from 'antd';
import { UserOutlined, RocketOutlined, TeamOutlined, CalendarOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { User } from '@/types/auth';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;

interface WelcomePanelProps {
  user: User | null;
  permissions: string[];
}

const WelcomePanel: React.FC<WelcomePanelProps> = ({ user, permissions }) => {
  const router = useRouter();
  
  // Tính thời gian chào hỏi dựa trên giờ trong ngày
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Danh sách tính năng chính của hệ thống
  const features = [
    {
      title: 'Quản lý người dùng',
      icon: <UserOutlined />,
      description: 'Tạo và quản lý tài khoản người dùng với các quyền khác nhau',
      path: '/dashboard/users'
    },
    {
      title: 'Quản lý nhóm',
      icon: <TeamOutlined />,
      description: 'Phân quyền theo nhóm để quản lý hiệu quả',
      path: '/dashboard/groups'
    },
    {
      title: 'Lịch họp & cuộc họp',
      icon: <CalendarOutlined />,
      description: 'Lên lịch và tham gia các cuộc họp trực tuyến',
      path: '/dashboard/meetings'
    },
    {
      title: 'Dự án cộng tác',
      icon: <RocketOutlined />,
      description: 'Quản lý dự án và làm việc cùng nhau',
      path: '/dashboard/projects'
    }
  ];

  // Những tính năng mà người dùng có thể truy cập
  const accessibleFeatures = features.filter(feature => {
    if (feature.path === '/dashboard/users' && permissions.includes('users.view')) return true;
    if (feature.path === '/dashboard/groups' && permissions.includes('groups.view')) return true;
    if (feature.path === '/dashboard/meetings' && permissions.includes('meetings.view')) return true;
    if (feature.path === '/dashboard/projects' && permissions.includes('collab.view_projects')) return true;
    return false;
  });

  return (
    <div className="welcome-panel">
      {/* Hero Section */}
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: 8,
          backgroundImage: 'linear-gradient(to right, #1890ff11, #1890ff22)',
          borderTop: '4px solid #1890ff'
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: '#1890ff',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
              }} 
            />
            <Title level={3} style={{ margin: 0 }}>
              {user?.displayName || 'Người dùng'}
            </Title>
            <Text type="secondary">{user?.email}</Text>
            
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<SettingOutlined />}
                  onClick={() => router.push('/dashboard/profile')}
                >
                  Hồ sơ cá nhân
                </Button>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} md={16}>
            <Title level={2} style={{ marginTop: 0 }}>
              {getGreeting()}, {user?.displayName?.split(' ')[0] || 'bạn'}!
            </Title>
            
            <Paragraph style={{ fontSize: 16 }}>
              Chào mừng bạn đến với hệ thống DevBreak - nền tảng quản lý người dùng và cộng tác hiện đại.
              Đây là không gian làm việc cá nhân của bạn, nơi bạn có thể truy cập các tính năng và công cụ
              dựa trên quyền hạn của mình.
            </Paragraph>
            
            <Paragraph>
              <Space>
                <Tag color="blue">Vai trò: {permissions.includes('system.manage') ? 'Quản trị viên' : 'Người dùng'}</Tag>
                <Tag color={user?.isActive ? 'green' : 'red'}>
                  {user?.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </Tag>
              </Space>
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* Tính năng có thể truy cập */}
      <Card title="Tính năng bạn có thể truy cập" style={{ marginBottom: 24 }}>
        {accessibleFeatures.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 4 }}
            dataSource={accessibleFeatures}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => router.push(item.path)}
                  style={{ textAlign: 'center', height: '100%' }}
                >
                  <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 12 }}>
                    {item.icon}
                  </div>
                  <Title level={4} style={{ marginTop: 0 }}>{item.title}</Title>
                  <Paragraph type="secondary">{item.description}</Paragraph>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Paragraph type="secondary" style={{ textAlign: 'center', padding: 24 }}>
            Hiện tại bạn chưa có quyền truy cập vào các tính năng chính.
            Vui lòng liên hệ quản trị viên để được cấp quyền.
          </Paragraph>
        )}
      </Card>

      {/* Giới thiệu về DevBreak */}
      <Card title="Giới thiệu về DevBreak" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Paragraph style={{ fontSize: 15 }}>
              <strong>DevBreak</strong> là một hệ thống quản lý người dùng toàn diện với phân quyền RBAC 
              (Role-Based Access Control) phức tạp, được thiết kế để đáp ứng nhu cầu của các tổ chức hiện đại.
            </Paragraph>
            <Paragraph>
              Hệ thống cho phép quản lý người dùng, nhóm, và phân quyền một cách linh hoạt và hiệu quả.
              Ngoài ra, DevBreak còn cung cấp các tính năng cộng tác như quản lý dự án, công việc,
              và tổ chức cuộc họp trực tuyến.
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>Tính năng chính</Title>
            <ul style={{ paddingLeft: 20 }}>
              <li><Text strong>Phân quyền RBAC</Text> - Hệ thống phân quyền chi tiết theo cấu trúc cha-con</li>
              <li><Text strong>Quản lý nhóm</Text> - Gán quyền cho nhóm thay vì từng người dùng</li>
              <li><Text strong>Quản lý dự án</Text> - Tạo và quản lý dự án với các thành viên</li>
              <li><Text strong>Cuộc họp trực tuyến</Text> - Tổ chức họp với WebRTC</li>
              <li><Text strong>Báo cáo hàng ngày</Text> - Theo dõi tiến độ công việc</li>
              <li><Text strong>Thông báo realtime</Text> - Cập nhật hoạt động ngay lập tức</li>
            </ul>
          </Col>
        </Row>
        
        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Space>
            <Button icon={<FileTextOutlined />} onClick={() => router.push('/dashboard/documentation')}>
              Xem tài liệu
            </Button>
            <Button type="primary" icon={<TeamOutlined />} onClick={() => router.push('/dashboard/profile')}>
              Cập nhật hồ sơ
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default WelcomePanel;
