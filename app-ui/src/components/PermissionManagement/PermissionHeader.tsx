import React from 'react';
import { Row, Col, Typography, Space, Button } from 'antd';
import { SafetyCertificateOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PermissionHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onAdd: () => void;
}

const PermissionHeader: React.FC<PermissionHeaderProps> = ({
  loading,
  onRefresh,
  onAdd,
}) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <Title level={4} style={{ margin: 0, fontWeight: 500 }}>
          <SafetyCertificateOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Quản lý Quyền
        </Title>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Quản lý hệ thống quyền và phân cấp truy cập
        </Text>
      </Col>
      <Col>
        <Space size="small">
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            style={{ borderRadius: 4, boxShadow: 'none' }}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onAdd}
            style={{ borderRadius: 4, boxShadow: 'none' }}
          >
            Thêm quyền
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default PermissionHeader;
