'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Input,
  Row,
  Col,
  Tag,
  Switch,
  Result,
  Dropdown,
  MenuProps,
  App,
} from 'antd';
import {
  SafetyCertificateOutlined,
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { PermissionResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  AddPermissionModal,
  EditPermissionModal,
  DeletePermissionModal,
} from '@/components/PermissionManagement';

const { Title, Text } = Typography;
const { Search } = Input;

const PermissionsPage: React.FC = () => {
  const { message } = App.useApp();
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionResponse | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { permissions: userPermissions } = useAuth();

  const canManagePermissions = userPermissions.includes('system.manage') || 
                               userPermissions.includes('system.menus.manage');

  // Filtered permissions based on search
  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission =>
      permission.code.toLowerCase().includes(searchText.toLowerCase()) ||
      permission.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (permission.description || '').toLowerCase().includes(searchText.toLowerCase())
    );
  }, [permissions, searchText]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPermissions();
      setPermissions(response);
      message.success('Tải danh sách quyền thành công');
    } catch (error) {
      message.error('Không thể tải danh sách quyền');
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleEdit = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setEditModalVisible(true);
  };

  const handleDelete = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setDeleteModalVisible(true);
  };

  const getActionMenu = (permission: PermissionResponse): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: 'Chỉnh sửa',
        icon: <EditOutlined />,
        onClick: () => handleEdit(permission),
      },
      {
        key: 'delete',
        label: 'Xóa',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(permission),
      },
    ],
  });

  const columns = [
    {
      title: 'Mã quyền',
      dataIndex: 'code',
      key: 'code',
      width: 200,
      render: (code: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Quyền cha',
      dataIndex: 'parentCode',
      key: 'parentCode',
      width: 150,
      render: (parentCode: string | null) => (
        parentCode ? (
          <Tag color="blue" style={{ fontSize: '11px' }}>
            {parentCode}
          </Tag>
        ) : (
          <Tag color="default" style={{ fontSize: '11px' }}>
            Root
          </Tag>
        )
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Switch 
          checked={isActive} 
          size="small"
          disabled
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {new Date(date).toLocaleDateString('vi-VN')}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: (_: any, permission: PermissionResponse) => (
        <Dropdown menu={getActionMenu(permission)} trigger={['click']}>
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            style={{ padding: '4px 8px' }}
          />
        </Dropdown>
      ),
    },
  ];

  if (!canManagePermissions) {
    return (
      <Card>
        <Result
          status="403"
          title="Không có quyền truy cập"
          subTitle="Bạn không có quyền xem trang quản lý quyền"
        />
      </Card>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0, fontWeight: 500 }}>
            <SafetyCertificateOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Quản lý Quyền
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Quản lý hệ thống quyền và phân cấp truy cập
          </Text>
        </Col>
        <Col>
          <Space>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={fetchPermissions}
              loading={loading}
              style={{ borderRadius: 4, boxShadow: 'none' }}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
              style={{ borderRadius: 4, boxShadow: 'none' }}
            >
              Thêm quyền
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Controls */}
      <Card size="small" style={{ marginBottom: 0, borderRadius: 6 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm quyền theo mã, tên hoặc mô tả..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={16}>
            <Space style={{ float: 'right' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Tổng: {filteredPermissions.length} quyền
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        size="small"
        style={{ 
          marginTop: 16, 
          borderRadius: 6,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredPermissions}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredPermissions.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} quyền`,
            size: 'small',
          }}
          size="small"
          scroll={{ x: 800 }}
          style={{ 
            backgroundColor: '#fff',
          }}
        />
      </Card>

      {/* Modals */}
      <AddPermissionModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={fetchPermissions}
        permissions={permissions}
      />

      <EditPermissionModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={fetchPermissions}
        permissions={permissions}
        selectedPermission={selectedPermission}
        loading={updateLoading}
      />

      <DeletePermissionModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onSuccess={fetchPermissions}
        selectedPermission={selectedPermission}
        loading={updateLoading}
      />
    </div>
  );
};

export default PermissionsPage;
