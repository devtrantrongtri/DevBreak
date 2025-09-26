'use client';

import React from 'react';
import { Modal, Form, Select, Space, Button, Alert, Tag } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { MenuResponse, PermissionResponse } from '@/types/api';

interface RebindPermissionModalProps {
  visible: boolean;
  loading: boolean;
  selectedMenu: MenuResponse | null;
  permissions: PermissionResponse[];
  onCancel: () => void;
  onSubmit: (values: { permissionCode: string }) => void;
};

const RebindPermissionModal: React.FC<RebindPermissionModalProps> = ({
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
      const currentPermissionCode = selectedMenu.permission?.code || selectedMenu.permissionCode;
      form.setFieldsValue({ permissionCode: currentPermissionCode });
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
          <SafetyCertificateOutlined />
          <span>Thay đổi quyền menu</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
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
        message="Cảnh báo"
        description="Thay đổi quyền menu sẽ ảnh hưởng đến khả năng truy cập của người dùng. Hãy chắc chắn về quyết định này."
        type="warning"
        showIcon
        style={{ marginBottom: 20, fontSize: '12px' }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="permissionCode"
          label="Quyền truy cập"
          rules={[{ required: true, message: 'Vui lòng chọn quyền' }]}
        >
          <Select
            placeholder="Chọn quyền truy cập"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              const children = option?.children as any;
              if (!children?.props?.children) return false;

              const childrenArray = children.props.children;
              if (!Array.isArray(childrenArray)) return false;

              // Search in permission name (first element)
              const nameMatch = childrenArray[0]?.toLowerCase?.()?.includes(input.toLowerCase()) || false;

              // Search in permission code (second element - Tag component)
              const codeMatch = childrenArray[1]?.props?.children?.toLowerCase?.()?.includes(input.toLowerCase()) || false;

              return nameMatch || codeMatch;
            }}
          >
            {permissions.map(permission => (
              <Select.Option key={permission.code} value={permission.code}>
                <Space>
                  <span style={{ fontSize: '13px' }}>{permission.name}</span>
                  <Tag color="blue" style={{ fontSize: '11px' }}>{permission.code}</Tag>
                  {selectedMenu && (selectedMenu.permission?.code || selectedMenu.permissionCode) === permission.code && (
                    <Tag color="green" style={{ fontSize: '10px' }}>Hiện tại</Tag>
                  )}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {selectedMenu && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: 4,
            marginBottom: 16
          }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>Menu:</strong> {selectedMenu.name}
              <br />
              <strong>Quyền hiện tại:</strong> {selectedMenu.permission?.code || selectedMenu.permissionCode}
              <br />
              <strong>Đường dẫn:</strong> {selectedMenu.path}
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
              icon={<SafetyCertificateOutlined />}
              style={{ borderRadius: 4, boxShadow: 'none' }}
            >
              Cập nhật quyền
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RebindPermissionModal;
