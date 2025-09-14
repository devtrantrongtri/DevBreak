'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Typography, Space, Alert, List, Tag, message, App } from 'antd';
import { PermissionResponse } from '@/types/api';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  ExclamationCircleOutlined,
  UserOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface DeletePermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedPermission: PermissionResponse | null;
  loading: boolean;
}

interface PermissionUsage {
  users: Array<{ id: string; displayName: string; email: string }>;
  groups: Array<{ id: string; name: string; description?: string }>;
  childPermissions: Array<{ code: string; name: string }>;
}

const DeletePermissionModal: React.FC<DeletePermissionModalProps> = ({
  visible,
  onClose,
  onSuccess,
  selectedPermission,
  loading,
}) => {
  const { message } = App.useApp();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [usage, setUsage] = useState<PermissionUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const { refreshUserData } = useAuth();

  useEffect(() => {
    if (visible && selectedPermission) {
      fetchPermissionUsage();
    }
  }, [visible, selectedPermission]);

  const fetchPermissionUsage = async () => {
    if (!selectedPermission) return;

    try {
      setUsageLoading(true);
      // This would be an API call to check permission usage
      // For now, we'll simulate the response
      const mockUsage: PermissionUsage = {
        users: [], // Would come from API
        groups: [], // Would come from API  
        childPermissions: [], // Would come from API
      };
      setUsage(mockUsage);
    } catch (error) {
      console.error('Error fetching permission usage:', error);
      message.error('Không thể kiểm tra việc sử dụng quyền');
    } finally {
      setUsageLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPermission) return;

    try {
      setDeleteLoading(true);
      
      await apiClient.deletePermission(selectedPermission.id);
      
      message.success('Xóa quyền thành công');
      
      // Refresh user data to update permissions
      await refreshUserData();
      
      onSuccess();
      onClose();
    } catch (error) {
      message.error('Không thể xóa quyền');
      console.error('Error deleting permission:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasUsage = usage && (
    usage.users.length > 0 || 
    usage.groups.length > 0 || 
    usage.childPermissions.length > 0
  );

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Xác nhận xóa quyền</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnHidden
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: 'calc(100vh - 200px)', 
          overflowY: 'auto',
          padding: '24px'
        }
      }}
    >
      <Alert
        message="Cảnh báo quan trọng"
        description="Việc xóa quyền sẽ ảnh hưởng đến toàn bộ hệ thống và không thể hoàn tác."
        type="error"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div style={{ marginBottom: 24 }}>
        <Title level={5}>Thông tin quyền sẽ bị xóa:</Title>
        <div style={{ 
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '6px',
          border: '1px solid #d9d9d9'
        }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Mã quyền: </Text>
              <Text code>{selectedPermission?.code}</Text>
            </div>
            <div>
              <Text strong>Tên quyền: </Text>
              <Text>{selectedPermission?.name}</Text>
            </div>
            {selectedPermission?.description && (
              <div>
                <Text strong>Mô tả: </Text>
                <Text type="secondary">{selectedPermission.description}</Text>
              </div>
            )}
            {selectedPermission?.parentCode && (
              <div>
                <Text strong>Quyền cha: </Text>
                <Tag color="blue">{selectedPermission.parentCode}</Tag>
              </div>
            )}
          </Space>
        </div>
      </div>

      {usageLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="secondary">Đang kiểm tra việc sử dụng quyền...</Text>
        </div>
      ) : hasUsage ? (
        <div style={{ marginBottom: 24 }}>
          <Alert
            message="Quyền này đang được sử dụng"
            description="Việc xóa sẽ gỡ bỏ quyền này khỏi tất cả người dùng và nhóm đang sử dụng."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {usage?.users && usage.users.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <UserOutlined style={{ marginRight: 8 }} />
                Người dùng đang có quyền này ({usage.users.length}):
              </Title>
              <List
                size="small"
                dataSource={usage.users}
                renderItem={(user) => (
                  <List.Item>
                    <Text>{user.displayName}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>({user.email})</Text>
                  </List.Item>
                )}
                style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
            </div>
          )}

          {usage?.groups && usage.groups.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <TeamOutlined style={{ marginRight: 8 }} />
                Nhóm đang có quyền này ({usage.groups.length}):
              </Title>
              <List
                size="small"
                dataSource={usage.groups}
                renderItem={(group) => (
                  <List.Item>
                    <Text>{group.name}</Text>
                    {group.description && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>- {group.description}</Text>
                    )}
                  </List.Item>
                )}
                style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
            </div>
          )}

          {usage?.childPermissions && usage.childPermissions.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <WarningOutlined style={{ marginRight: 8 }} />
                Quyền con sẽ bị ảnh hưởng ({usage.childPermissions.length}):
              </Title>
              <List
                size="small"
                dataSource={usage.childPermissions}
                renderItem={(permission) => (
                  <List.Item>
                    <Text code>{permission.code}</Text>
                    <Text style={{ marginLeft: 8 }}>- {permission.name}</Text>
                  </List.Item>
                )}
                style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <Alert
          message="Quyền này chưa được sử dụng"
          description="Có thể xóa an toàn mà không ảnh hưởng đến người dùng hoặc nhóm nào."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Paragraph style={{ marginBottom: 24 }}>
        <Text strong>Bạn có chắc chắn muốn xóa quyền này không?</Text>
        <br />
        <Text type="secondary">
          Hành động này không thể hoàn tác và sẽ ảnh hưởng đến hệ thống ngay lập tức.
        </Text>
      </Paragraph>

      <div style={{ textAlign: 'right' }}>
        <Space>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 15px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteLoading || loading}
            style={{
              padding: '6px 15px',
              border: 'none',
              borderRadius: '6px',
              background: deleteLoading ? '#f5f5f5' : '#ff4d4f',
              color: deleteLoading ? '#999' : '#fff',
              cursor: deleteLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </Space>
      </div>
    </Modal>
  );
};

export default DeletePermissionModal;
