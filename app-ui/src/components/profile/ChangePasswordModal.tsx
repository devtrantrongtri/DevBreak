'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  App,
} from 'antd';
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';

const { Text } = Typography;

interface ChangePasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  userId: string;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onCancel,
  userId,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ChangePasswordForm) => {
    try {
      setLoading(true);
      
      // Call API to change password
      await apiClient.request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      message.success('Đổi mật khẩu thành công');
      form.resetFields();
      onCancel();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Không thể đổi mật khẩu';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Mật khẩu mới là bắt buộc'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự'));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Xác nhận mật khẩu là bắt buộc'));
    }
    if (value !== form.getFieldValue('newPassword')) {
      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined />
          <span>Đổi mật khẩu</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={450}
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
        message="Lưu ý bảo mật"
        description="Mật khẩu mới phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            { required: true, message: 'Mật khẩu hiện tại là bắt buộc' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu hiện tại"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[{ validator: validatePassword }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          rules={[{ validator: validateConfirmPassword }]}
          dependencies={['newPassword']}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập lại mật khẩu mới"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Space size="small">
            <Button
              size="small"
              onClick={handleCancel}
              style={{
                borderRadius: 4,
                boxShadow: 'none'
              }}
            >
              Hủy
            </Button>
            <Button
              size="small"
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SafetyCertificateOutlined />}
              style={{
                borderRadius: 4,
                boxShadow: 'none'
              }}
            >
              Đổi mật khẩu
            </Button>
          </Space>
        </div>
      </Form>

      <div style={{ marginTop: 16, padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <strong>Mẹo bảo mật:</strong>
          <br />
          • Sử dụng mật khẩu duy nhất cho mỗi tài khoản
          <br />
          • Không chia sẻ mật khẩu với người khác
          <br />
          • Thay đổi mật khẩu định kỳ (3-6 tháng)
          <br />
          • Sử dụng trình quản lý mật khẩu nếu có thể
        </Text>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
