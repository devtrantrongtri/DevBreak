'use client';

import React from 'react';
import { Table, Space, Tag, Tooltip, Button } from 'antd';
import { MenuOutlined, EditOutlined, SafetyCertificateOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons';
import { MenuResponse, PermissionResponse } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';

interface MenuTableProps {
  menus: MenuResponse[];
  permissions: PermissionResponse[];
  loading: boolean;
  canUpdateMenuName: boolean;
  canRebindPermission: boolean;
  canDeleteMenu: boolean;
  onEditMenu: (menu: MenuResponse) => void;
  onRebindPermission: (menu: MenuResponse) => void;
  onDeleteMenu: (menu: MenuResponse) => void;
}

export const MenuTable: React.FC<MenuTableProps> = ({
  menus,
  permissions,
  loading,
  canUpdateMenuName,
  canRebindPermission,
  canDeleteMenu,
  onEditMenu,
  onRebindPermission,
  onDeleteMenu,
}) => {
  const columns: ColumnsType<MenuResponse> = [
    {
      title: 'Menu',
      key: 'menu',
      width: '35%',
      render: (_, record) => (
        <Space>
          <MenuOutlined style={{ color: record.parent ? '#52c41a' : '#1890ff' }} />
          <div>
            <div style={{
              fontWeight: record.parent ? 400 : 500,
              fontSize: '14px',
              marginLeft: record.parent ? '16px' : '0'
            }}>
              {record.parent && '└ '}{record.name}
            </div>
            <div style={{
              color: '#666',
              fontSize: '12px',
              marginLeft: record.parent ? '16px' : '0'
            }}>
              <LinkOutlined style={{ marginRight: 4 }} />
              {record.path}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Quyền truy cập',
      dataIndex: 'permissionCode',
      key: 'permission',
      width: '25%',
      render: (permissionCode: string, record: MenuResponse) => {
        // Get permission code from either direct field or nested permission object
        const code = record.permission?.code || record.permissionCode || permissionCode;
        const permission = permissions.find(p => p.code === code);
        
        return (
          <div>
            <Tag
              color="blue"
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: 3,
                marginBottom: 4
              }}
            >
              {code}
            </Tag>
            {permission && (
              <div style={{ fontSize: '11px', color: '#666' }}>
                {permission.name}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: '10%',
      sorter: (a, b) => a.order - b.order,
      render: (order: number) => (
        <Tag color="default" style={{ fontSize: '11px' }}>
          {order}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      width: '15%',
      render: (isActive: boolean) => (
        <Tag
          color={isActive ? 'green' : 'red'}
          style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: 3
          }}
        >
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space size="small">
          {canUpdateMenuName && (
            <Tooltip title="Sửa tên menu">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditMenu(record)}
                style={{
                  borderRadius: 4,
                  color: '#1890ff'
                }}
              />
            </Tooltip>
          )}
          {canRebindPermission && (
            <Tooltip title="Thay đổi quyền">
              <Button
                type="text"
                size="small"
                icon={<SafetyCertificateOutlined />}
                onClick={() => onRebindPermission(record)}
                style={{
                  borderRadius: 4,
                  color: '#52c41a'
                }}
              />
            </Tooltip>
          )}
          {canDeleteMenu && (
            <Tooltip title="Xóa menu">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onDeleteMenu(record)}
                style={{
                  borderRadius: 4,
                  color: '#ff4d4f'
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={menus}
      rowKey={(record) => record.id}
      loading={loading}
      size="small"
      scroll={{
        x: 800,
        y: 'calc(100vh - 400px)'
      }}
      pagination={{
        pageSize: 15,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} trong ${total} menu`,
        pageSizeOptions: ['10', '15', '20', '50'],
      }}
      className="custom-table"
    />
  );
};
