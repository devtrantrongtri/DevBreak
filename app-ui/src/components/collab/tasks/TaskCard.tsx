'use client';

import React from 'react';
import { Card, Typography, Space, Avatar, Tag, Tooltip, Button } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DragOutlined
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TASK_PRIORITIES } from '@/types/collab';
import { useProject } from '@/contexts/ProjectContext';
import dayjs from 'dayjs';
import styles from './TaskBoard.module.css';

const { Text, Paragraph } = Typography;

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: Task['status']) => void;
  draggable?: boolean;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onStatusChange,
  draggable = true,
  isDragging = false
}) => {
  const { userRole, canPerformAction } = useProject();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled: !draggable,
  });

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'default',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority];
  };

  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day');
  const isDueSoon = task.dueDate && dayjs(task.dueDate).diff(dayjs(), 'day') <= 2 && !isOverdue;

  const canEdit = canPerformAction('update_task') || 
    (userRole === 'DEV' && task.assigneeId === task.assigneeId) ||
    (userRole === 'QC' && task.status === 'ready_for_qc');

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: isOverdue ? '1px solid #ff4d4f' : undefined,
    borderLeft: isOverdue ? '4px solid #ff4d4f' :
               isDueSoon ? '4px solid #faad14' : undefined,
  };

  const cardClasses = [
    styles.taskCard,
    isSortableDragging || isDragging ? styles.isDragging : '',
  ].filter(Boolean).join(' ');

  return (
    <Card
      ref={setNodeRef}
      size="small"
      className={cardClasses}
      style={style}
      bodyStyle={{ padding: 12 }}
      hoverable={!isSortableDragging}
      {...attributes}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 8
      }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <Text strong style={{ fontSize: '13px', lineHeight: 1.3 }}>
            {task.title}
          </Text>
        </div>
        
        <Space size={4}>
          <Tag
            color={getPriorityColor(task.priority)}
            size="small"
            style={{ margin: 0, fontSize: '10px' }}
          >
            {TASK_PRIORITIES[task.priority]}
          </Tag>

          {draggable && (
            <Button
              type="text"
              size="small"
              icon={<DragOutlined />}
              style={{
                padding: '2px 4px',
                height: 'auto',
                cursor: 'grab',
                color: '#999'
              }}
              {...listeners}
            />
          )}

          {canEdit && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={handleEdit}
              style={{ padding: '2px 4px', height: 'auto' }}
            />
          )}
        </Space>
      </div>

      {/* Description */}
      {task.description && (
        <Paragraph
          style={{ 
            margin: '0 0 8px 0', 
            fontSize: '12px',
            color: '#666',
            lineHeight: 1.3
          }}
          ellipsis={{ rows: 2 }}
        >
          {task.description}
        </Paragraph>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div style={{ marginBottom: 8 }}>
          <Space size={4}>
            <Avatar 
              size={16} 
              icon={<UserOutlined />}
              src={task.assignee.avatar}
            />
            <Text style={{ fontSize: '11px', color: '#666' }}>
              {task.assignee.displayName}
            </Text>
          </Space>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: '11px',
        color: '#999'
      }}>
        <div>
          {task.dueDate && (
            <Space size={4}>
              {isOverdue ? (
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              ) : isDueSoon ? (
                <ClockCircleOutlined style={{ color: '#faad14' }} />
              ) : (
                <CalendarOutlined />
              )}
              <Text 
                style={{ 
                  fontSize: '11px',
                  color: isOverdue ? '#ff4d4f' : isDueSoon ? '#faad14' : '#999'
                }}
              >
                {dayjs(task.dueDate).format('DD/MM')}
              </Text>
            </Space>
          )}
        </div>

        <div>
          <Text style={{ fontSize: '10px', color: '#ccc' }}>
            #{task.id.slice(-6)}
          </Text>
        </div>
      </div>

      {/* Overdue warning */}
      {isOverdue && (
        <div style={{ 
          marginTop: 8, 
          padding: '4px 8px', 
          background: '#fff2f0',
          borderRadius: 4,
          border: '1px solid #ffccc7'
        }}>
          <Text style={{ fontSize: '10px', color: '#ff4d4f' }}>
            <ExclamationCircleOutlined style={{ marginRight: 4 }} />
            Quá hạn {dayjs().diff(dayjs(task.dueDate), 'day')} ngày
          </Text>
        </div>
      )}
    </Card>
  );
};

export default TaskCard;
