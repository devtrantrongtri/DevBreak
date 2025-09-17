import React from 'react';
import { Space, Tag, Button, Tooltip, Popconfirm } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { UserResponse } from '@/types/api';

interface UserTableColumnsProps {
  canUpdateUser: boolean;
  canDeleteUser: boolean;
  onViewProfile: (userId: string) => void;
  onViewDetails: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onStatusToggle: (userId: string, currentStatus: boolean) => void;
}

export const useUserTableColumns = ({
  canUpdateUser,
  canDeleteUser,
  onViewProfile,
  onViewDetails,
  onEditUser,
  onDeleteUser,
  onStatusToggle,
}: UserTableColumnsProps): ColumnsType<UserResponse> => {
  return [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{record.displayName}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Nhóm',
      key: 'groups',
      render: (_, record) => (
        <Space wrap>
          {record.groups?.map(group => (
            <Tag key={group.id} icon={<TeamOutlined />}>
              {group.name}
            </Tag>
          )) || <span style={{ color: '#999' }}>Không có nhóm</span>}
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem hồ sơ">
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => onViewProfile(record.id)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => onViewDetails(record.id)}
            />
          </Tooltip>
          {canUpdateUser && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEditUser(record.id)}
              />
            </Tooltip>
          )}
          {canUpdateUser && (
            <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
              <Button
                type="text"
                onClick={() => onStatusToggle(record.id, record.isActive)}
              >
                {record.isActive ? 'X' : 'Y'}
              </Button>
            </Tooltip>
          )}
          {canDeleteUser && (
            <Popconfirm
              title="Xóa người dùng"
              description="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => onDeleteUser(record.id)}
              okText="Xóa"
              okType="danger"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa người dùng">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];
};
