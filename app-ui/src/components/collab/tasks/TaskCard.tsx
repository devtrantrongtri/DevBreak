'use client';

import React from 'react';
import { Card, Typography, Space, Avatar, Tag, Tooltip } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TASK_PRIORITIES } from '@/types/collab';

import dayjs from 'dayjs';
import styles from './TaskBoard.module.css';

const { Text } = Typography;

const CARD_HEIGHT = 100; // Reduced height for more compact design

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



  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: CARD_HEIGHT,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    border: isOverdue ? '1px solid #ff4d4f' : undefined,
    borderLeft: isOverdue ? '4px solid #ff4d4f' :
               isDueSoon ? '4px solid #faad14' : undefined,
  };

  const cardClasses = [
    styles.taskCard,
    isSortableDragging || isDragging ? styles.isDragging : '',
  ].filter(Boolean).join(' ');

  const handleCardClick = () => {
    onEdit?.(task);
  };

  return (
    <Card
      ref={setNodeRef}
      size="small"
      className={cardClasses}
      style={style}
      styles={{ body: { padding: 8 } }}
      hoverable={!isSortableDragging}
      onClick={handleCardClick}
      {...attributes}
      {...(draggable ? listeners : {})}
    >
      {/* Header - Title and Priority */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6
      }}>
        <Tooltip title={task.title} placement="topLeft">
          <Text
            strong
            style={{
              fontSize: '13px',
              lineHeight: 1.2,
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '140px'
            }}
          >
            {task.title}
          </Text>
        </Tooltip>

        <Tag
          color={getPriorityColor(task.priority)}
          style={{
            margin: 0,
            fontSize: '9px',
            padding: '0 4px',
            lineHeight: '16px',
            height: '16px'
          }}
        >
          {TASK_PRIORITIES[task.priority]}
        </Tag>
      </div>

      {/* Description - Compact */}
      {task.description && (
        <Tooltip title={task.description} placement="bottomLeft">
          <Text
            style={{
              fontSize: '11px',
              color: '#666',
              lineHeight: 1.3,
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: 6
            }}
          >
            {task.description}
          </Text>
        </Tooltip>
      )}

      {/* Middle Row - Assignee and Due Date */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
      }}>
        {/* Assignee */}
        {task.assignee ? (
          <Space size={4}>
            <Avatar size={14} icon={<UserOutlined />} />
            <Text style={{ fontSize: '10px', color: '#666' }}>
              {task.assignee.displayName.split(' ').slice(-1)[0]} {/* Show only last name */}
            </Text>
          </Space>
        ) : (
          <Text style={{ fontSize: '10px', color: '#ccc' }}>Chưa assign</Text>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <Space size={2}>
            {isOverdue ? (
              <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '10px' }} />
            ) : isDueSoon ? (
              <ClockCircleOutlined style={{ color: '#faad14', fontSize: '10px' }} />
            ) : (
              <CalendarOutlined style={{ fontSize: '10px' }} />
            )}
            <Text
              style={{
                fontSize: '10px',
                color: isOverdue ? '#ff4d4f' : isDueSoon ? '#faad14' : '#999'
              }}
            >
              {dayjs(task.dueDate).format('DD/MM')}
            </Text>
          </Space>
        )}
      </div>

      {/* Footer - Task ID and Status Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text style={{ fontSize: '9px', color: '#ccc' }}>
          #{task.id.slice(-6)}
        </Text>

        {isOverdue && (
          <Text style={{ fontSize: '9px', color: '#ff4d4f' }}>
            Quá hạn {dayjs().diff(dayjs(task.dueDate), 'day')}d
          </Text>
        )}
      </div>
    </Card>
  );
};

export default TaskCard;
