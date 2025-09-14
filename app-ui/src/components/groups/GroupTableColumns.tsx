import React from 'react';
import { Space, Tag, Button, Tooltip, Popconfirm, Progress } from 'antd';
import {
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { GroupResponse } from '@/types/api';

interface GroupTableColumnsProps {
  canUpdateGroup: boolean;
  canDeleteGroup: boolean;
  canAssignPermissions: boolean;
  onViewDetails: (groupId: string) => void;
  onEditGroup: (groupId: string) => void;
  onManagePermissions: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const useGroupTableColumns = ({
  canUpdateGroup,
  canDeleteGroup,
  canAssignPermissions,
  onViewDetails,
  onEditGroup,
  onManagePermissions,
  onDeleteGroup,
}: GroupTableColumnsProps): ColumnsType<GroupResponse> => {
  return [
    {
      title: 'Nhóm',
      key: 'group',
      render: (_, record) => (
        <Space>
          <TeamOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.code}</div>
            {record.description && (
              <div style={{ color: '#999', fontSize: '11px', marginTop: '2px' }}>
                {record.description}
              </div>
            )}
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
      title: 'Thành viên',
      key: 'members',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>{record.users?.length || 0}</span>
        </Space>
      ),
    },
    {
      title: 'Quyền',
      key: 'permissions',
      render: (_, record) => {
        const permissionCount = record.permissions?.length || 0;
        const maxPermissions = 25; // Approximate max permissions
        const percentage = Math.min((permissionCount / maxPermissions) * 100, 100);
        
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              <SafetyCertificateOutlined />
              <span>{permissionCount} quyền</span>
            </Space>
            <Progress 
              percent={percentage} 
              size="small" 
              showInfo={false}
              strokeColor={percentage > 80 ? '#52c41a' : percentage > 50 ? '#1890ff' : '#faad14'}
            />
          </Space>
        );
      },
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
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<TeamOutlined />}
              onClick={() => onViewDetails(record.id)}
            />
          </Tooltip>
          {canUpdateGroup && (
            <Tooltip title="Chỉnh sửa nhóm">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEditGroup(record.id)}
              />
            </Tooltip>
          )}
          {canAssignPermissions && (
            <Tooltip title="Quản lý quyền">
              <Button
                type="text"
                icon={<SafetyCertificateOutlined />}
                onClick={() => onManagePermissions(record.id)}
              />
            </Tooltip>
          )}
          {canDeleteGroup && (
            <Popconfirm
              title="Xóa nhóm"
              description="Bạn có chắc chắn muốn xóa nhóm này? Tất cả thành viên sẽ bị loại khỏi nhóm."
              onConfirm={() => onDeleteGroup(record.id)}
              okText="Xóa"
              okType="danger"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa nhóm">
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
