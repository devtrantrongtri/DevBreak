'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, InputNumber, message, App, Space, Alert, Button, TreeSelect } from 'antd';
import { MenuResponse, PermissionResponse } from '@/types/api';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import IconSelector from '@/components/common/IconSelector';
import {
  MenuOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  BranchesOutlined,
  OrderedListOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface AddMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  permissions: PermissionResponse[];
  menus: MenuResponse[];
}

interface CreateMenuData {
  name: string;
  path: string;
  icon?: string;
  description?: string;
  parentId?: string;
  permissionCode: string;
  order: number;
  isActive: boolean;
}

const AddMenuModal: React.FC<AddMenuModalProps> = ({
  visible,
  onClose,
  onSuccess,
  permissions,
  menus,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { refreshUserData } = useAuth();
  const [parentOptions, setParentOptions] = useState<Array<{
    title: string;
    value: string;
    key: string;
  }>>([]);

  useEffect(() => {
    if (menus.length > 0) {
      const options = menus
        .filter(menu => !menu.parent) // Only root menus can be parents
        .map(menu => ({
          title: menu.name,
          value: menu.id,
          key: menu.id,
        }));
      setParentOptions(options);
    }
  }, [menus]);

  const handleSubmit = async (values: CreateMenuData) => {
    try {
      setLoading(true);
      
      // Validate path format
      if (!values.path.startsWith('/')) {
        message.error('Đường dẫn phải bắt đầu bằng /');
        return;
      }

      // Check for duplicate paths
      const isDuplicatePath = menus.some(menu => menu.path === values.path);
      if (isDuplicatePath) {
        message.error('Đường dẫn này đã tồn tại');
        return;
      }

      await apiClient.createMenu({
        ...values,
        parentId: values.parentId || null,
      });

      message.success('Tạo menu thành công');
      form.resetFields();
      
      // Refresh user data to update sidebar menu
      await refreshUserData();
      
      onSuccess();
      onClose();
    } catch (error) {
      message.error('Không thể tạo menu');
      console.error('Error creating menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const validatePath = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject('Vui lòng nhập đường dẫn menu');
    }
    
    if (!value.startsWith('/')) {
      return Promise.reject('Đường dẫn phải bắt đầu bằng "/"');
    }

    if (value.includes(' ')) {
      return Promise.reject('Đường dẫn không được chứa khoảng trắng');
    }

    // Check if path already exists
    const existingMenu = menus.find(menu => menu.path === value);
    if (existingMenu) {
      return Promise.reject('Đường dẫn này đã tồn tại');
    }

    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <Space>
          <MenuOutlined style={{ color: '#1890ff' }} />
          <span>Thêm Menu Mới</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          padding: '24px'
        },
        header: { padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }
      }}
    >
      <Alert
        message="Lưu ý quan trọng"
        description="Sau khi tạo menu, hãy đảm bảo đã tạo page tương ứng tại đường dẫn này. Nếu chưa có page, người dùng sẽ thấy trang 404 khi truy cập."
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
          order: 1,
        }}
      >
        <Form.Item
          name="name"
          label={
            <Space>
              <MenuOutlined />
              Tên menu
            </Space>
          }
          rules={[
            { required: true, message: 'Vui lòng nhập tên menu' },
            { min: 2, message: 'Tên menu phải có ít nhất 2 ký tự' },
            { max: 50, message: 'Tên menu không được quá 50 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên menu (ví dụ: Quản lý sản phẩm)" />
        </Form.Item>

        <Form.Item
          name="path"
          label={
            <Space>
              <LinkOutlined />
              Đường dẫn
            </Space>
          }
          rules={[{ validator: validatePath }]}
        >
          <Input 
            placeholder="Nhập đường dẫn (ví dụ: /dashboard/products)" 
            addonBefore="/"
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <span>Icon</span>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Space>
          }
          name="icon"
          extra="Chọn icon từ danh sách có sẵn"
        >
          <IconSelector placeholder="Chọn icon cho menu" />
        </Form.Item>

        <Form.Item
          name="parentId"
          label={
            <Space>
              <BranchesOutlined />
              Menu cha (tùy chọn)
            </Space>
          }
        >
          <TreeSelect
            placeholder="Chọn menu cha hoặc để trống nếu là menu gốc"
            allowClear
            treeData={parentOptions}
            showSearch
            treeDefaultExpandAll
          />
        </Form.Item>

        <Form.Item
          name="permissionCode"
          label={
            <Space>
              <SafetyCertificateOutlined />
              Quyền truy cập
            </Space>
          }
          rules={[{ required: true, message: 'Vui lòng chọn quyền truy cập' }]}
        >
          <Select
            placeholder="Chọn quyền cần thiết để truy cập menu này"
            showSearch
            optionFilterProp="children"
          >
            {permissions.map(permission => (
              <Option key={permission.code} value={permission.code}>
                <Space>
                  <span>{permission.name}</span>
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    ({permission.code})
                  </span>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="order"
          label={
            <Space>
              <OrderedListOutlined />
              Thứ tự hiển thị
            </Space>
          }
          rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
        >
          <InputNumber 
            min={1} 
            max={100} 
            style={{ width: '100%' }}
            placeholder="Nhập số thứ tự (1-100)"
          />
        </Form.Item>



        <Form.Item
          name="description"
          label="Mô tả (tùy chọn)"
        >
          <TextArea 
            placeholder="Mô tả ngắn về chức năng của menu này"
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Trạng thái"
          valuePropName="checked"
        >
          <Switch 
            checkedChildren="Kích hoạt" 
            unCheckedChildren="Vô hiệu hóa"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<MenuOutlined />}
            >
              Tạo menu
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMenuModal;
