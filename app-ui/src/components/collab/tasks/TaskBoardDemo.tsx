'use client';

import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { Task } from '@/types/collab';
import TaskBoard from './TaskBoard';


const { Option } = Select;
const { TextArea } = Input;

// Demo component for testing TaskBoard
const TaskBoardDemo: React.FC = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTaskCreate = (status?: Task['status']) => {
    setIsCreateModalVisible(true);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalVisible(true);
  };

  const handleModalClose = () => {
    setIsCreateModalVisible(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = async (values: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    dueDate?: string;
  }) => {
    try {
      if (editingTask) {
        // Update task logic here
        message.success('Cập nhật task thành công');
      } else {
        // Create task logic here
        message.success('Tạo task thành công');
      }
      handleModalClose();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <TaskBoard
        onTaskCreate={handleTaskCreate}
        onTaskEdit={handleTaskEdit}
      />

      <Modal
        title={editingTask ? 'Chỉnh sửa Task' : 'Tạo Task mới'}
        open={isCreateModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleTaskSubmit}
          initialValues={editingTask || {}}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề task..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả chi tiết..." 
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Mức độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}
          >
            <Select placeholder="Chọn mức độ ưu tiên">
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
              <Option value="urgent">Khẩn cấp</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="todo">Cần làm</Option>
              <Option value="in_process">Đang làm</Option>
              <Option value="ready_for_qc">Chờ QC</Option>
              <Option value="done">Hoàn thành</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Hạn hoàn thành"
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Chọn ngày hạn hoàn thành"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={handleModalClose} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingTask ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskBoardDemo;
