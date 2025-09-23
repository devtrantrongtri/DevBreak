'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  message,
  Divider,
  Typography,
  Tag
} from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Task, TASK_PRIORITIES, TASK_STATUSES } from '@/types/collab';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

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

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  onCancel: () => void;
  onSuccess: () => void;
  onDelete?: (taskId: string) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  visible,
  task,
  onCancel,
  onSuccess,
  onDelete
}) => {
  const [form] = Form.useForm();
  const { currentProject, canPerformAction } = useProject();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  // Load project members when modal opens
  useEffect(() => {
    if (visible && currentProject) {
      loadMembers();
    }
  }, [visible, currentProject]);

  // Reset form when task changes
  useEffect(() => {
    if (task && visible) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        estimatedHours: task.estimatedHours,
        actualHours: parseFloat(task.actualHours || '0')
      });
    }
  }, [task, visible, form]);

  const loadMembers = async () => {
    if (!currentProject) return;

    try {
      const response = await apiClient.request<ProjectMember[]>(`/collab/projects/${currentProject.id}/members`);
      setMembers(response);
    } catch (error) {
      console.error('Load members failed:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!task) return;

    setLoading(true);
    try {
      const updateData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        actualHours: values.actualHours?.toString() || '0'
      };

      // Call API to update task
      await apiClient.request(`/collab/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      message.success('Task đã được cập nhật thành công');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Error updating task:', error);
      message.error('Có lỗi xảy ra khi cập nhật task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    Modal.confirm({
      title: 'Xác nhận xóa task',
      content: `Bạn có chắc chắn muốn xóa task "${task.title}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading(true);
        try {
          await apiClient.request(`/collab/tasks/${task.id}`, {
            method: 'DELETE',
          });

          message.success('Task đã được xóa thành công');
          onDelete?.(task.id);
          onCancel();
        } catch (error) {
          console.error('Error deleting task:', error);
          message.error('Có lỗi xảy ra khi xóa task');
        } finally {
          setDeleteLoading(false);
        }
      }
    });
  };

  const canEdit = () => {
    if (!task || !user) return false;

    // PM can edit any task
    if (canPerformAction?.('update_task')) return true;

    // DEV can edit their assigned tasks
    if (canPerformAction?.('update_assigned_task') && task.assignedTo === user.id) {
      return true;
    }

    // QC can edit tasks in ready_for_qc status
    if (canPerformAction?.('update_qc_task') && task.status === 'ready_for_qc') {
      return true;
    }

    return false;
  };

  const canDeleteTask = () => {
    if (!task || !user) return false;
    return canPerformAction?.('delete_task') || task.createdBy === user.id;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'default',
      medium: 'blue', 
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      todo: 'default',
      in_process: 'processing',
      ready_for_qc: 'warning',
      done: 'success'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  if (!task) return null;

  return (
    <Modal
      title={
        <Space size="small">
          <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
            Chỉnh sửa Task
          </Title>
          <Tag color={getStatusColor(task.status)} style={{ fontSize: '11px', padding: '1px 6px' }}>
            {TASK_STATUSES[task.status as keyof typeof TASK_STATUSES]}
          </Tag>
          <Tag color={getPriorityColor(task.priority)} style={{ fontSize: '11px', padding: '1px 6px' }}>
            {TASK_PRIORITIES[task.priority as keyof typeof TASK_PRIORITIES]}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={500}
      style={{ top: 20 }}
      styles={{
        body: {
          padding: '12px',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto'
        }
      }}
      footer={[
        <Button key="cancel" size="small" onClick={onCancel}>
          Hủy
        </Button>,
        ...(canDeleteTask() ? [
          <Button
            key="delete"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={deleteLoading}
          >
            Xóa
          </Button>
        ] : []),
        <Button
          key="submit"
          size="small"
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          loading={loading}
          disabled={!canEdit()}
        >
          Lưu
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={!canEdit()}
        style={{
          fontSize: '13px'
        }}
        className="compact-form"
      >
        <style jsx>{`
          :global(.compact-form .ant-form-item-label > label) {
            font-size: 12px !important;
            font-weight: 500 !important;
            margin-bottom: 2px !important;
          }
          :global(.compact-form .ant-form-item) {
            margin-bottom: 12px !important;
          }
          :global(.compact-form .ant-input) {
            font-size: 13px !important;
            padding: 4px 8px !important;
          }
          :global(.compact-form .ant-select-selector) {
            font-size: 13px !important;
            padding: 2px 8px !important;
          }
          :global(.compact-form .ant-picker) {
            font-size: 13px !important;
            padding: 4px 8px !important;
          }
          :global(.compact-form .ant-input-number) {
            font-size: 13px !important;
          }
          :global(.compact-form .ant-input-number-input) {
            padding: 4px 8px !important;
          }
        `}</style>
        {/* Task Info */}
        <div style={{ marginBottom: 8 }}>
          <Space size="small" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              <UserOutlined /> {task.creator?.displayName} • {dayjs(task.createdAt).format('DD/MM HH:mm')}
            </Text>
            {task.updatedAt !== task.createdAt && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <ClockCircleOutlined /> Cập nhật: {dayjs(task.updatedAt).format('DD/MM HH:mm')}
              </Text>
            )}
          </Space>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* Basic Info */}
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề task' }]}
          style={{ marginBottom: 12 }}
        >
          <Input
            placeholder="Nhập tiêu đề task"
            style={{ fontSize: '13px' }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          style={{ marginBottom: 12 }}
        >
          <TextArea
            rows={2}
            placeholder="Nhập mô tả chi tiết cho task"
            style={{ fontSize: '13px' }}
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 8 }}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            style={{ flex: 1, marginBottom: 12 }}
          >
            <Select placeholder="Chọn trạng thái" style={{ fontSize: '13px' }}>
              {Object.entries(TASK_STATUSES).map(([key, value]) => (
                <Option key={key} value={key}>
                  <Tag color={getStatusColor(key)} style={{ margin: 0, fontSize: '11px', padding: '1px 4px' }}>
                    {value}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
            style={{ flex: 1, marginBottom: 12 }}
          >
            <Select placeholder="Chọn độ ưu tiên" style={{ fontSize: '13px' }}>
              {Object.entries(TASK_PRIORITIES).map(([key, value]) => (
                <Option key={key} value={key}>
                  <Tag color={getPriorityColor(key)} style={{ margin: 0, fontSize: '11px', padding: '1px 4px' }}>
                    {value}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="assignedTo"
          label="Assign cho"
          style={{ marginBottom: 12 }}
        >
          <Select
            placeholder="Chọn thành viên..."
            allowClear
            showSearch
            style={{ fontSize: '13px' }}
            filterOption={(input, option) =>
              (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {members.map(member => (
              <Select.Option key={member.userId} value={member.userId}>
                <Space size="small">
                  <Tag
                    color={
                      member.role === 'PM' ? 'red' :
                      member.role === 'BC' ? 'blue' :
                      member.role === 'DEV' ? 'green' : 'orange'
                    }
                    style={{ fontSize: '10px', padding: '1px 4px', margin: 0 }}
                  >
                    {member.role}
                  </Tag>
                  <span style={{ fontSize: '13px' }}>{member.user.displayName}</span>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', gap: 8 }}>
          <Form.Item
            name="dueDate"
            label="Hạn hoàn thành"
            style={{ flex: 1, marginBottom: 12 }}
          >
            <DatePicker
              style={{ width: '100%', fontSize: '13px' }}
              placeholder="Chọn ngày hạn"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="estimatedHours"
            label="Ước tính (h)"
            style={{ flex: 1, marginBottom: 12 }}
          >
            <InputNumber
              min={0}
              step={0.5}
              placeholder="0"
              style={{ width: '100%', fontSize: '13px' }}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="actualHours"
          label="Thực tế (giờ)"
          style={{ marginBottom: 8 }}
        >
          <InputNumber
            min={0}
            step={0.5}
            placeholder="0"
            style={{ width: '100%', fontSize: '13px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTaskModal;
