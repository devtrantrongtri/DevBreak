import React from 'react';
import { Row, Col, Typography, Space, Button } from 'antd';
import {
  UserOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface UserPageHeaderProps {
  loading: boolean;
  exportLoading: boolean;
  canCreateUser: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  onCreate: () => void;
}

const   UserPageHeader: React.FC<UserPageHeaderProps> = ({
  loading,
  exportLoading,
  canCreateUser,
  onRefresh,
  onExport,
  onImport,
  onCreate,
}) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 5 }}>
      <Col>
        <Title level={3} style={{ margin: 0, fontWeight: 500 }}>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Quản lý người dùng
        </Title>
        {/* <Text type="secondary" style={{ fontSize: '13px' }}>
          Quản lý tài khoản người dùng và phân quyền
        </Text> */}
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
            size="small"
            icon={<SearchOutlined />}
            onClick={onExport}
            loading={exportLoading}
            style={{ borderRadius: 4, boxShadow: 'none' }}
          >
            Xuất dữ liệu
          </Button>
          {canCreateUser && (
            <>
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={onImport}
                style={{ borderRadius: 4, boxShadow: 'none' }}
              >
                Nhập dữ liệu
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onCreate}
                style={{ borderRadius: 4, boxShadow: 'none' }}
              >
                Thêm người dùng
              </Button>
            </>
          )}
        </Space>
      </Col>
    </Row>
  );
};

export default UserPageHeader;
