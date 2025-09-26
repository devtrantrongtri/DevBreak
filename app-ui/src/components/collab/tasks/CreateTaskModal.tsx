'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Space,
  Typography,
  Tag
} from 'antd';
import { PlusOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface CreateTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  initialStatus?: 'todo' | 'in_process' | 'ready_for_qc' | 'done';
}

interface CreateTaskForm {
  title: string;
  description?: string;
  status: 'todo' | 'in_process' | 'ready_for_qc' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: dayjs.Dayjs;
  estimatedHours?: number;
}

interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
}

const TASK_STATUSES = [
  { value: 'todo', label: 'Cần làm', color: 'default' },
  { value: 'in_process', label: 'Đang làm', color: 'processing' },
  { value: 'ready_for_qc', label: 'Chờ QC', color: 'warning' },
  { value: 'done', label: 'Hoàn thành', color: 'success' }
];

const PRIORITIES = [
  { value: 'low', label: 'Thấp', color: 'green' },
  { value: 'medium', label: 'Trung bình', color: 'blue' },
  { value: 'high', label: 'Cao', color: 'orange' },
  { value: 'urgent', label: 'Khẩn cấp', color: 'red' }
];

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  initialStatus = 'todo'
}) => {
  const [form] = Form.useForm<CreateTaskForm>();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const { currentProject } = useProject();

  // Load project members when modal opens
  useEffect(() => {
    if (visible && currentProject) {
      loadMembers();
    }
  }, [visible, currentProject]);

  const loadMembers = async () => {
    if (!currentProject) return;

    try {
      const response = await apiClient.request<ProjectMember[]>(`/collab/projects/${currentProject.id}/members`);
      setMembers(response);
    } catch (error) {
      console.error('Load members failed:', error);
    }
  };

  const handleSubmit = async (values: CreateTaskForm) => {
    if (!currentProject) return;

    try {
      setLoading(true);

      const taskData = {
        title: values.title,
        description: values.description || '',
        projectId: currentProject.id,
        status: values.status || 'todo',
        priority: values.priority || 'medium',
        assignedTo: values.assignedTo || null,
        dueDate: values.dueDate?.format('YYYY-MM-DD') || null,
        estimatedHours: values.estimatedHours ? Number(values.estimatedHours) : null,
      };

      console.log('Sending task data:', taskData);

      await apiClient.request('/collab/tasks', {
        method: 'POST',
        data: taskData
      });

      message.success('Tạo task thành công!');
      form.resetFields();
      onSuccess?.();
      onCancel();
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      console.error('Create task failed:', error);

      // Handle validation errors
      if (error?.response?.data?.message) {
        const errorMessages = Array.isArray(error.response.data.message)
          ? error.response.data.message
          : [error.response.data.message];

        errorMessages.forEach((msg: string) => {
          message.error(msg);
        });
      } else {
        message.error(error?.message || 'Tạo task thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <CheckSquareOutlined />
          Tạo task mới
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
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
          status: initialStatus,
          priority: 'medium'
        }}
      >
        <Form.Item
          name="title"
          label="Tiêu đề task"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề task' },
            { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
            { max: 200, message: 'Tiêu đề không được quá 200 ký tự' }
          ]}
        >
          <Input
            placeholder="Nhập tiêu đề task..."
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
        >
          <TextArea
            placeholder="Mô tả chi tiết về task..."
            rows={4}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="status"
            label="Trạng thái"
            style={{ flex: 1 }}
          >
            <Select size="large">
              {TASK_STATUSES.map(status => (
                <Select.Option key={status.value} value={status.value}>
                  <Space>
                    <Tag color={status.color}>{status.label}</Tag>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            style={{ flex: 1 }}
          >
            <Select size="large">
              {PRIORITIES.map(priority => (
                <Select.Option key={priority.value} value={priority.value}>
                  <Space>
                    <Tag color={priority.color}>{priority.label}</Tag>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="assignedTo"
          label="Assign cho"
        >
          <Select
            size="large"
            placeholder="Chọn thành viên..."
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {members.map(member => (
              <Select.Option key={member.userId} value={member.userId}>
                <Space>
                  <Tag color={
                    member.role === 'PM' ? 'red' :
                    member.role === 'BC' ? 'blue' :
                    member.role === 'DEV' ? 'green' : 'orange'
                  }>
                    {member.role}
                  </Tag>
                  {member.user.displayName}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="dueDate"
            label="Hạn hoàn thành"
            style={{ flex: 1 }}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              placeholder="Chọn ngày hạn"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="estimatedHours"
            label="Ước tính (giờ)"
            style={{ flex: 1 }}
          >
            <Input
              type="number"
              min={0.5}
              max={100}
              step={0.5}
              placeholder="8"
              size="large"
              suffix="giờ"
            />
          </Form.Item>
        </div>

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
            Tạo task
          </Button>
        </div>
      </Form>

      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 <strong>Lưu ý:</strong> Task sẽ được tạo trong dự án <strong>{currentProject?.name}</strong>. 
          Bạn có thể assign cho thành viên khác sau khi tạo.
        </Text>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;
