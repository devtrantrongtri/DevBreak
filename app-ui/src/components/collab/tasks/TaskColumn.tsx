'use client';

import React from 'react';
import { Typography, Space, Button, Badge, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskColumn as TaskColumnType } from '@/types/collab';
import { useProject } from '@/contexts/ProjectContext';
import TaskCard from './TaskCard';
import styles from './TaskBoard.module.css';

const { Text } = Typography;

const CARD_HEIGHT = 100;
const CARD_GAP = 8;
const BODY_PADDING_Y = 12;
const BODY_MAX_HEIGHT = (CARD_HEIGHT * 4) + (CARD_GAP * 3) + (BODY_PADDING_Y * 2);

interface TaskColumnProps {
  column: TaskColumnType;
  tasks: Task[];
  onTaskEdit?: (task: Task) => void;
  onTaskCreate?: (status: Task['status']) => void;
  onTaskMove?: (task: Task, newStatus: Task['status']) => void;
  activeTaskId?: string;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  tasks,
  onTaskEdit,
  onTaskCreate,
  onTaskMove,
  activeTaskId
}) => {
  const { canPerformAction } = useProject();

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.status}`,
  });

  const canCreateTask = canPerformAction('create_task');
  const canMoveTask = (task: Task) => {
    // PM can move any task
    if (canPerformAction('assign_task')) return true;
    
    // DEV can move their assigned tasks
    if (canPerformAction('update_assigned_task') && task.assignedTo) {
      return true; // Would need to check if current user is assignee
    }
    
    // QC can move tasks from ready_for_qc to done
    if (canPerformAction('update_qc_task') && task.status === 'ready_for_qc') {
      return true;
    }
    
    return false;
  };

  const handleTaskMove = (task: Task) => {
    if (canMoveTask(task)) {
      onTaskMove?.(task, column.status);
    }
  };

  const handleCreateTask = () => {
    if (canCreateTask) {
      onTaskCreate?.(column.status);
    }
  };

  // Count overdue tasks
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date()
  ).length;

  const taskIds = tasks.map(task => task.id);

  return (
    <div
      ref={setNodeRef}
      className={`${styles.taskColumn} ${isOver ? styles.isOver : ''}`}
    >
      {/* Column Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: column.color,
        borderRadius: '8px 8px 0 0'
      }}>
        <Space>
          <Text strong style={{ fontSize: '14px' }}>
            {column.title}
          </Text>
          <Badge 
            count={tasks.length} 
            style={{ 
              backgroundColor: '#d9d9d9',
              color: '#666',
              fontSize: '11px'
            }}
          />
          {overdueTasks > 0 && (
            <Badge 
              count={overdueTasks} 
              style={{ 
                backgroundColor: '#ff4d4f',
                fontSize: '10px'
              }}
            />
          )}
        </Space>

        {canCreateTask && column.status === 'todo' && (
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleCreateTask}
            style={{ padding: '4px' }}
          />
        )}
      </div>

      {/* Column Content */}
      <div style={{
        padding: 12,
        minHeight: BODY_MAX_HEIGHT,
        maxHeight: BODY_MAX_HEIGHT,
        overflowY: 'auto',
        flex: 1
      }}>
        {tasks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Chưa có task nào
              </Text>
            }
            style={{ margin: '20px 0' }}
          />
        ) : (
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div>
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onTaskEdit}
                  onStatusChange={onTaskMove}
                  draggable={canMoveTask(task)}
                  isDragging={task.id === activeTaskId}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {/* Column Footer */}
      {tasks.length > 0 && (
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #f0f0f0',
          background: 'white',
          borderRadius: '0 0 8px 8px'
        }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {tasks.length} task{tasks.length > 1 ? 's' : ''}
            {overdueTasks > 0 && (
              <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                • {overdueTasks} quá hạn
              </span>
            )}
          </Text>
        </div>
      )}
    </div>
  );
};

export default TaskColumn;
