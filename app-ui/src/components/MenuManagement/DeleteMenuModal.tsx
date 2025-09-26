'use client';

import React, { useState } from 'react';
import { Modal, Typography, Space, Button, Alert, App } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, MenuOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { MenuResponse } from '@/types/api';

const { Title, Text, Paragraph } = Typography;

interface DeleteMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedMenu: MenuResponse | null;
}

const DeleteMenuModal: React.FC<DeleteMenuModalProps> = ({
  visible,
  onClose,
  onSuccess,
  selectedMenu,
}) => {
  const { message } = App.useApp();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { refreshUserData } = useAuth();

  const handleDelete = async () => {
    if (!selectedMenu) return;

    try {
      setDeleteLoading(true);
      
      await apiClient.deleteMenu(selectedMenu.id);
      
      message.success('Xóa menu thành công');
      
      // Refresh user data to update sidebar menu
      await refreshUserData();
      
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      // Check if error is a 404 Not Found, which means the menu was already deleted
      if (error.message && error.message.includes('not found')) {
        message.success('Xóa menu thành công');
        await refreshUserData();
        onSuccess();
        onClose();
      } else {
        message.error('Không thể xóa menu');
        console.error('Error deleting menu:', error);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Xác nhận xóa menu</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
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
        description="Việc xóa menu sẽ ảnh hưởng đến navigation và không thể hoàn tác."
        type="error"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div style={{ marginBottom: 24 }}>
        <Title level={5}>Thông tin menu sẽ bị xóa:</Title>
        <div style={{ 
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '6px',
          border: '1px solid #d9d9d9'
        }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Tên menu: </Text>
              <Text>{selectedMenu?.name}</Text>
            </div>
            <div>
              <Text strong>Đường dẫn: </Text>
              <Text code>{selectedMenu?.path}</Text>
            </div>
            {selectedMenu?.description && (
              <div>
                <Text strong>Mô tả: </Text>
                <Text type="secondary">{selectedMenu.description}</Text>
              </div>
            )}
            <div>
              <Text strong>Quyền: </Text>
              <Text code>{selectedMenu?.permission?.code || selectedMenu?.permissionCode}</Text>
            </div>
          </Space>
        </div>
      </div>

      <Alert
        message="Lưu ý"
        description="Menu sẽ biến mất khỏi sidebar của tất cả người dùng ngay lập tức."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Paragraph style={{ marginBottom: 24 }}>
        <Text strong>Bạn có chắc chắn muốn xóa menu này không?</Text>
        <br />
        <Text type="secondary">
          Hành động này không thể hoàn tác.
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
            disabled={deleteLoading}
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
            <DeleteOutlined style={{ marginRight: 4 }} />
            {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </Space>
      </div>
    </Modal>
  );
};

export default DeleteMenuModal;
