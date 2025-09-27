'use client';

import React, { useState, useEffect } from 'react';
import { Popover, Card, Typography, Space, Tag, Avatar, Spin, Button } from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Task, TASK_PRIORITIES, TASK_STATUSES } from '@/types/collab';
import { apiClient } from '@/lib/api';

const { Text, Paragraph } = Typography;

interface TaskPreviewPopoverProps {
  taskId: string;
  children: React.ReactNode;
  onTaskClick: (taskId: string) => void;
}

const TaskPreviewPopover: React.FC<TaskPreviewPopoverProps> = ({
  taskId,
  children,
  onTaskClick
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  // Load task data when popover opens
  const loadTaskData = async () => {
    if (loading || task) return;

    setLoading(true);
    try {
      const taskData = await apiClient.getTaskPreview(taskId);
      setTask(taskData);
    } catch (error) {
      console.error('Failed to load task preview:', error);
      // Create a minimal task object for display
      setTask({
        id: taskId,
        code: taskId,
        projectId: 'unknown',
        title: `Task ${taskId}`,
        description: 'Không thể tải thông tin chi tiết task.',
        status: 'todo',
        priority: 'medium',
        createdBy: 'unknown',
        creator: {
          id: 'unknown',
          displayName: 'Unknown User',
          email: 'unknown@example.com'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: undefined,
        estimatedHours: undefined,
        actualHours: 0,
        tags: [],
        isActive: true
      } as Task);
    } finally {
      setLoading(false);
    }
  };

  const handleVisibleChange = (newVisible: boolean) => {
    setVisible(newVisible);
    if (newVisible && !task && !loading) {
      loadTaskData();
    }
  };

  const handleTaskClick = () => {
    setVisible(false);
    onTaskClick(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in_process': return 'processing';
      case 'ready_for_qc': return 'warning';
      case 'done': return 'success';
      default: return 'default';
    }
  };

  const isOverdue = task?.dueDate && isBefore(new Date(task.dueDate), startOfDay(new Date()));

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Spin size="small" />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">Đang tải...</Text>
          </div>
        </div>
      );
    }

    if (!task) {
      return (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Text type="secondary">Không tìm thấy task</Text>
        </div>
      );
    }

    return (
      <Card 
        size="small" 
        style={{ width: 320, margin: 0 }}
        bodyStyle={{ padding: 16 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text strong style={{ fontSize: 14 }}>
                {task.title}
              </Text>
              <Text code style={{ fontSize: 12 }}>
                {taskId}
              </Text>
            </div>
            
            <Space size="small" wrap>
              <Tag color={getStatusColor(task.status)}>
                {TASK_STATUSES[task.status]}
              </Tag>
              <Tag color={getPriorityColor(task.priority)}>
                {TASK_PRIORITIES[task.priority]}
              </Tag>
              {isOverdue && (
                <Tag color="red" icon={<ExclamationCircleOutlined />}>
                  Quá hạn
                </Tag>
              )}
            </Space>
          </Space>
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ marginBottom: 12 }}>
            <Paragraph 
              style={{ 
                margin: 0, 
                fontSize: 13,
                color: '#666'
              }}
              ellipsis={{ rows: 2, expandable: false }}
            >
              {task.description}
            </Paragraph>
          </div>
        )}

        {/* Details */}
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          {/* Assignee */}
          {task.assignee && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ marginRight: 8, color: '#666' }} />
              <Space size={6}>
                <Avatar size={20} icon={<UserOutlined />}>
                  {task.assignee.displayName.charAt(0)}
                </Avatar>
                <Text style={{ fontSize: 12 }}>
                  {task.assignee.displayName}
                </Text>
              </Space>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ 
                marginRight: 8, 
                color: isOverdue ? '#ff4d4f' : '#666' 
              }} />
              <Text 
                style={{ 
                  fontSize: 12,
                  color: isOverdue ? '#ff4d4f' : undefined
                }}
              >
                Hạn: {format(new Date(task.dueDate), 'dd/MM/yyyy')}
              </Text>
            </div>
          )}

          {/* Started Date */}
          {task.startedAt && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ClockCircleOutlined style={{ marginRight: 8, color: '#666' }} />
              <Text style={{ fontSize: 12 }}>
                Bắt đầu: {format(new Date(task.startedAt), 'dd/MM/yyyy')}
              </Text>
            </div>
          )}
        </Space>

        {/* Action Button */}
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={handleTaskClick}
          >
            Xem chi tiết
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <Popover
      content={renderContent()}
      trigger="hover"
      placement="topLeft"
      open={visible}
      onOpenChange={handleVisibleChange}
      overlayStyle={{ maxWidth: 'none' }}
      mouseEnterDelay={0.3}
      mouseLeaveDelay={0.1}
    >
      {children}
    </Popover>
  );
};

export default TaskPreviewPopover;
