'use client';

import React from 'react';
import { Modal, Form, Input, Space, Button, Alert } from 'antd';
import { EditOutlined, SaveOutlined, MenuOutlined } from '@ant-design/icons';
import { MenuResponse } from '@/types/api';

interface EditMenuModalProps {
  visible: boolean;
  loading: boolean;
  selectedMenu: MenuResponse | null;
  onCancel: () => void;
  onSubmit: (values: { name: string }) => void;
}

const EditMenuModal: React.FC<EditMenuModalProps> = ({
  visible,
  loading,
  selectedMenu,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && selectedMenu) {
      form.setFieldsValue({ name: selectedMenu.name });
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
          <span>Sửa tên menu</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={450}
      styles={{
        body: { padding: '20px' },
        header: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }
      }}
    >
      <Alert
        message="Thông tin"
        description="Thay đổi tên hiển thị của menu. Đường dẫn và quyền không thay đổi."
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
          label="Tên menu"
          rules={[
            { required: true, message: 'Tên menu là bắt buộc' },
            { min: 2, message: 'Tên menu phải có ít nhất 2 ký tự' },
            { max: 50, message: 'Tên menu không được quá 50 ký tự' },
          ]}
        >
          <Input
            placeholder="Nhập tên menu mới"
            prefix={<MenuOutlined />}
          />
        </Form.Item>

        {selectedMenu && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 4,
            marginBottom: 16
          }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>Menu hiện tại:</strong> {selectedMenu.name}
              <br />
              <strong>Đường dẫn:</strong> {selectedMenu.path}
              <br />
              <strong>Quyền:</strong> {selectedMenu.permission?.code || selectedMenu.permissionCode}
            </div>
          </div>
        )}

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space size="small">
            <Button
              size="small"
              onClick={handleCancel}
              style={{ borderRadius: 4, boxShadow: 'none' }}
            >
              Hủy
            </Button>
            <Button
              size="small"
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              style={{ borderRadius: 4, boxShadow: 'none' }}
            >
              Cập nhật
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditMenuModal;
