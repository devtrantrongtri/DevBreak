'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Space, Button, Alert, message } from 'antd';
import { EditOutlined, SaveOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { InfoCircleOutlined } from '@ant-design/icons';
import { PermissionResponse } from '@/types/api';

const { TextArea } = Input;
const { Option } = Select;

interface EditPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  permissions: PermissionResponse[];
  selectedPermission: PermissionResponse | null;
  loading: boolean;
}

interface UpdatePermissionData {
  name: string;
  description?: string;
  parentCode?: string | null;
  isActive: boolean;
}

const EditPermissionModal: React.FC<EditPermissionModalProps> = ({
  visible,
  onClose,
  onSuccess,
  permissions,
  selectedPermission,
  loading,
}) => {
  const [form] = Form.useForm();
  const { refreshUserData } = useAuth();

  useEffect(() => {
    if (visible && selectedPermission) {
      form.setFieldsValue({
        name: selectedPermission.name,
        description: selectedPermission.description || '',
        parentCode: selectedPermission.parentCode || undefined,
        isActive: selectedPermission.isActive,
      });
    }
  }, [visible, selectedPermission, form]);

  const handleSubmit = async (values: UpdatePermissionData) => {
    if (!selectedPermission) return;

    try {
      await apiClient.updatePermission(selectedPermission.id, {
        ...values,
        parentCode: values.parentCode || null,
      });

      message.success('Cập nhật quyền thành công');
      
      // Refresh user data to update permissions
      await refreshUserData();
      
      onSuccess();
      onClose();
    } catch (error) {
      message.error('Không thể cập nhật quyền');
      console.error('Error updating permission:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
          <span>Chỉnh sửa Quyền</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label={
            <Space>
              <span>Mã quyền</span>
              <InfoCircleOutlined style={{ color: '#999' }} />
            </Space>
          }
          extra="Mã quyền không thể thay đổi"
        >
          <Input 
            value={selectedPermission?.code}
            disabled
            style={{ fontSize: '14px', backgroundColor: '#f5f5f5' }}
          />
        </Form.Item>

        <Form.Item
          label="Tên quyền"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên quyền' },
            { min: 3, message: 'Tên quyền phải có ít nhất 3 ký tự' }
          ]}
        >
          <Input 
            placeholder="Nhập tên quyền"
            style={{ fontSize: '14px' }}
          />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea 
            placeholder="Mô tả chi tiết về quyền này..."
            rows={3}
            style={{ fontSize: '14px' }}
          />
        </Form.Item>

        <Form.Item
          label="Quyền cha"
          name="parentCode"
          extra="Chọn quyền cha để tạo cấu trúc phân cấp"
        >
          <Select
            placeholder="Chọn quyền cha (tùy chọn)"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {permissions
              .filter(p => !p.parentCode && p.code !== selectedPermission?.code) // Exclude self and show only root permissions
              .map(permission => (
                <Option key={permission.code} value={permission.code}>
                  {permission.code} - {permission.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="isActive"
          valuePropName="checked"
        >
          <Switch 
            checkedChildren="Kích hoạt" 
            unCheckedChildren="Vô hiệu hóa"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleCancel}
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
              type="submit"
              disabled={loading}
              style={{
                padding: '6px 15px',
                border: 'none',
                borderRadius: '6px',
                background: loading ? '#f5f5f5' : '#1890ff',
                color: loading ? '#999' : '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPermissionModal;
