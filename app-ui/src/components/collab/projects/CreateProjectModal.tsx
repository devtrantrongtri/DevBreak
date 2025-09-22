'use client';

import React, { useState, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Space,
  Typography,
  App
} from 'antd';
import { ProjectOutlined, PlusOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useProject } from '@/contexts/ProjectContext';

const { TextArea } = Input;
const { Text } = Typography;

interface CreateProjectModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

interface CreateProjectForm {
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm<CreateProjectForm>();
  const [loading, setLoading] = useState(false);
  const { refreshProjects } = useProject();
  const { message: messageApi } = App.useApp();

  const handleSubmit = async (values: CreateProjectForm) => {
    try {
      setLoading(true);
      
      await apiClient.request('/collab/projects', {
        method: 'POST',
        body: JSON.stringify(values)
      });

      messageApi.success('Tạo dự án thành công!');
      form.resetFields();
      await refreshProjects();
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      console.error('Create project failed:', error);
      messageApi.error(error?.message || 'Tạo dự án thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Auto-generate code from name
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const code = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 10);

    // Use setTimeout to avoid circular updates
    setTimeout(() => {
      form.setFieldValue('code', code);
    }, 0);
  }, [form]);

  return (
    <Modal
      title={
        <Space>
          <ProjectOutlined />
          Tạo dự án mới
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
        header: { 
          padding: '16px 24px', 
          borderBottom: '1px solid #f0f0f0' 
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'active'
        }}
      >
        <Form.Item
          name="name"
          label="Tên dự án"
          rules={[
            { required: true, message: 'Vui lòng nhập tên dự án' },
            { min: 3, message: 'Tên dự án phải có ít nhất 3 ký tự' },
            { max: 100, message: 'Tên dự án không được quá 100 ký tự' }
          ]}
        >
          <Input
            placeholder="Nhập tên dự án..."
            onChange={handleNameChange}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="code"
          label="Mã dự án"
          rules={[
            { required: true, message: 'Vui lòng nhập mã dự án' },
            { pattern: /^[A-Z0-9_]+$/, message: 'Mã dự án chỉ được chứa chữ hoa, số và dấu gạch dưới' },
            { min: 2, message: 'Mã dự án phải có ít nhất 2 ký tự' },
            { max: 20, message: 'Mã dự án không được quá 20 ký tự' }
          ]}
        >
          <Input
            placeholder="PROJECT_CODE"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea
            placeholder="Mô tả về dự án..."
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
        >
          <Select size="large">
            <Select.Option value="active">Hoạt động</Select.Option>
            <Select.Option value="inactive">Tạm dừng</Select.Option>
          </Select>
        </Form.Item>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 8,
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button onClick={handleCancel} size="large">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<PlusOutlined />}
            size="large"
          >
            Tạo dự án
          </Button>
        </div>
      </Form>

      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 <strong>Lưu ý:</strong> Sau khi tạo dự án, bạn sẽ tự động trở thành Project Manager (PM) 
          và có thể mời thành viên khác tham gia.
        </Text>
      </div>
    </Modal>
  );
};

export default CreateProjectModal;
