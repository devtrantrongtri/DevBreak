import React from 'react';
import { Card, Row, Col, Statistic, Tag, Space } from 'antd';
import { 
  SafetyCertificateOutlined, 
  RobotOutlined, 
  UserOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { PermissionResponse } from '@/types/api';

interface PermissionStatsProps {
  permissions: PermissionResponse[];
}

const PermissionStats: React.FC<PermissionStatsProps> = ({ permissions }) => {
  const stats = React.useMemo(() => {
    const total = permissions.length;
    const autoDiscovered = permissions.filter(p => 
      p.description?.includes('Auto-discovered')
    ).length;
    const manual = total - autoDiscovered;
    const active = permissions.filter(p => p.isActive).length;
    const inactive = total - active;
    const rootPermissions = permissions.filter(p => !p.parentCode).length;
    const childPermissions = total - rootPermissions;

    return {
      total,
      autoDiscovered,
      manual,
      active,
      inactive,
      rootPermissions,
      childPermissions
    };
  }, [permissions]);

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Tổng quyền"
            value={stats.total}
            prefix={<SafetyCertificateOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Tự động phát hiện"
            value={stats.autoDiscovered}
            prefix={<RobotOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
            suffix={
              <Tag color="green">
                {stats.total > 0 ? Math.round((stats.autoDiscovered / stats.total) * 100) : 0}%
              </Tag>
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Tạo thủ công"
            value={stats.manual}
            prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
            valueStyle={{ color: '#fa8c16' }}
            suffix={
              <Tag color="orange">
                {stats.total > 0 ? Math.round((stats.manual / stats.total) * 100) : 0}%
              </Tag>
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Phân cấp"
            value={`${stats.rootPermissions}/${stats.childPermissions}`}
            prefix={<BranchesOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            suffix={
              <Space size={4}>
                <Tag color="purple">Root</Tag>
                <Tag color="geekblue">Child</Tag>
              </Space>
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Trạng thái"
            value={`${stats.active}/${stats.inactive}`}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            suffix={
              <Space size={4}>
                <Tag color="success">Hoạt động</Tag>
                <Tag color="default">Tạm dừng</Tag>
              </Space>
            }
          />
        </Card>
      </Col>
    </Row>
  );
};

export default PermissionStats;
