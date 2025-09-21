'use client';

import React from 'react';
import { Modal, Form, Input, Space, Button, Alert, Select, Switch, InputNumber, Divider } from 'antd';
import { EditOutlined, SaveOutlined, MenuOutlined, LinkOutlined, SafetyCertificateOutlined, OrderedListOutlined } from '@ant-design/icons';
import { MenuResponse, PermissionResponse } from '@/types/api';
import IconSelector from '@/components/common/IconSelector';
import { getIconByName } from '@/constants/icons';

interface EditMenuData {
  name: string;
  path: string;
  icon?: string;
  description?: string;
  permissionCode: string;
  order: number;
  isActive: boolean;
}

interface EditMenuModalProps {
  visible: boolean;
  loading: boolean;
  selectedMenu: MenuResponse | null;
  permissions: PermissionResponse[];
  onCancel: () => void;
  onSubmit: (values: EditMenuData) => void;
}

const EditMenuModal: React.FC<EditMenuModalProps> = ({
  visible,
  loading,
  selectedMenu,
  permissions,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && selectedMenu) {
      form.setFieldsValue({
        name: selectedMenu.name,
        path: selectedMenu.path,
        icon: selectedMenu.icon,
        description: selectedMenu.description,
        permissionCode: selectedMenu.permission?.code || selectedMenu.permissionCode,
        order: selectedMenu.order || 1,
        isActive: selectedMenu.isActive !== false,
      });
    }
  }, [visible, selectedMenu, form]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <span>Chỉnh sửa menu</span>
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
        message="Thông tin"
        description="Chỉnh sửa thông tin menu bao gồm tên, đường dẫn, icon, quyền và các thuộc tính khác."
        type="info"
        showIcon
        style={{ marginBottom: 20, fontSize: '12px' }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
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
            { required: true, message: 'Tên menu là bắt buộc' },
            { min: 2, message: 'Tên menu phải có ít nhất 2 ký tự' },
            { max: 50, message: 'Tên menu không được quá 50 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên menu" />
        </Form.Item>

        <Form.Item
          name="path"
          label={
            <Space>
              <LinkOutlined />
              Đường dẫn
            </Space>
          }
          rules={[
            { required: true, message: 'Đường dẫn là bắt buộc' },
            { pattern: /^\//, message: 'Đường dẫn phải bắt đầu bằng /' },
          ]}
        >
          <Input placeholder="Nhập đường dẫn (ví dụ: /dashboard/users)" />
        </Form.Item>

        <Form.Item
          name="icon"
          label="Icon"
        >
          <IconSelector placeholder="Chọn icon cho menu" />
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
            placeholder="Chọn quyền truy cập"
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {permissions.map(permission => (
              <Select.Option key={permission.code} value={permission.code}>
                {permission.name} ({permission.code})
              </Select.Option>
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
          <Input.TextArea
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

        <Divider />

        {selectedMenu && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 4,
            marginBottom: 16
          }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>Menu gốc:</strong> {selectedMenu.name}
              <br />
              <strong>Đường dẫn gốc:</strong> {selectedMenu.path}
              <br />
              <strong>Quyền gốc:</strong> {selectedMenu.permission?.code || selectedMenu.permissionCode}
              <br />
              <strong>Icon hiện tại:</strong>
              <Space style={{ marginLeft: 8 }}>
                {selectedMenu.icon && getIconByName(selectedMenu.icon)}
                <span>{selectedMenu.icon || 'Không có'}</span>
              </Space>
            </div>
          </div>
        )}

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space size="small">
            <Button
              onClick={handleCancel}
              style={{ borderRadius: 4, boxShadow: 'none' }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              style={{ borderRadius: 4, boxShadow: 'none' }}
            >
              Cập nhật menu
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditMenuModal;
