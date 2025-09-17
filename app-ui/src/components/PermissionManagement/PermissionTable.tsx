import React from 'react';
import { Tag, Switch, Button, Dropdown, MenuProps } from 'antd';
import FixedHeightTable from '@/components/common/FixedHeightTable';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PermissionResponse } from '@/types/api';
import { Typography } from 'antd';

const { Text } = Typography;

interface PermissionTableProps {
  permissions: PermissionResponse[];
  loading: boolean;
  onEdit: (permission: PermissionResponse) => void;
  onDelete: (permission: PermissionResponse) => void;
}

const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  loading,
  onEdit,
  onDelete,
}) => {
  const getActionMenu = (permission: PermissionResponse): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: 'Chỉnh sửa',
        icon: <EditOutlined />,
        onClick: () => onEdit(permission),
      },
      {
        key: 'delete',
        label: 'Xóa',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => onDelete(permission),
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

  return (
    <FixedHeightTable
      columns={columns}
      dataSource={permissions}
      rowKey="id"
      loading={loading}
      pagination={{
        total: permissions.length,
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} của ${total} quyền`
      }}
      containerHeight="calc(100vh - 230px)"
      scrollY="calc(100vh - 330px)"
      scrollX={800}
    />
  );
};

export default PermissionTable;
