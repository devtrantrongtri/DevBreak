import React from 'react';
import { Row, Col, Typography, Space, Button } from 'antd';
import {
  TeamOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

interface GroupPageHeaderProps {
  loading: boolean;
  exportLoading: boolean;
  canCreateGroup: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onCreate: () => void;
}

const GroupPageHeader: React.FC<GroupPageHeaderProps> = ({
  loading,
  exportLoading,
  canCreateGroup,
  onRefresh,
  onExport,
  onCreate,
}) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
      <Col>
        <Title level={3} style={{ margin: 0, fontWeight: 500 }}>
          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Quản lý nhóm
        </Title>
      </Col>
      <Col>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            style={{ borderRadius: 4, boxShadow: 'none' }}
          >
            Làm mới
          </Button>
          <Button
            icon={<SearchOutlined />}
            onClick={onExport}
            loading={exportLoading}
            style={{ borderRadius: 4, boxShadow: 'none' }}
          >
            Xuất dữ liệu
          </Button>
          {canCreateGroup && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              style={{ borderRadius: 4, boxShadow: 'none' }}
            >
              Tạo nhóm mới
            </Button>
          )}
        </Space>
      </Col>
    </Row>
  );
};

export default GroupPageHeader;
