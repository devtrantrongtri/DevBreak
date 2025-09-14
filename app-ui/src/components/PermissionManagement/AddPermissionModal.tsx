'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, Space, Button, Alert, message, App } from 'antd';
import { PlusOutlined, SaveOutlined, UserAddOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { InfoCircleOutlined } from '@ant-design/icons';
import { PermissionResponse } from '@/types/api';

const { TextArea } = Input;
const { Option } = Select;

interface AddPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  permissions: PermissionResponse[];
}

interface CreatePermissionData {
  code: string;
  name: string;
  description?: string;
  parentCode?: string | null;
  isActive: boolean;
}

const AddPermissionModal: React.FC<AddPermissionModalProps> = ({
  visible,
  onClose,
  onSuccess,
  permissions,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { refreshUserData } = useAuth();

  const handleSubmit = async (values: CreatePermissionData) => {
    try {
      setLoading(true);
      
      // Check for duplicate codes
      const isDuplicateCode = permissions.some(permission => permission.code === values.code);
      if (isDuplicateCode) {
        message.error('Mã quyền này đã tồn tại');
        return;
      }

      await apiClient.createPermission({
        ...values,
        parentCode: values.parentCode || null,
      });

      message.success('Tạo quyền thành công');
      form.resetFields();
      
      // Refresh user data to update permissions
      await refreshUserData();
      
      onSuccess();
      onClose();
    } catch (error) {
      message.error('Không thể tạo quyền');
      console.error('Error creating permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const validateCode = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập mã quyền'));
    }
    
    // Check format: only lowercase letters, numbers, dots, and underscores
    const codeRegex = /^[a-z0-9._]+$/;
    if (!codeRegex.test(value)) {
      return Promise.reject(new Error('Mã quyền chỉ được chứa chữ thường, số, dấu chấm và gạch dưới'));
    }

    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
          <span>Thêm Quyền Mới</span>
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
      <Alert
        message="Lưu ý quan trọng"
        description="Quyền một khi tạo sẽ ảnh hưởng đến toàn bộ hệ thống. Hãy cân nhắc kỹ trước khi tạo và đặt tên mã quyền rõ ràng, dễ hiểu."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isActive: true,
        }}
      >
        <Form.Item
          label={
            <Space>
              <span>Mã quyền</span>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Space>
          }
          name="code"
          rules={[
            { validator: validateCode }
          ]}
          extra="Ví dụ: user.create, system.manage, menu.update"
        >
          <Input 
            placeholder="Nhập mã quyền (ví dụ: user.create)"
            style={{ fontSize: '14px' }}
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
            placeholder="Nhập tên quyền (ví dụ: Tạo người dùng)"
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
              .filter(p => !p.parentCode) // Only show root permissions as parent options
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
              {loading ? 'Đang tạo...' : 'Tạo quyền'}
            </button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPermissionModal;
