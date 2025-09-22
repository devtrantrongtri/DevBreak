'use client';

import React from 'react';
import { Space, Button, Spin, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useProject } from '@/contexts/ProjectContext';
import { Task, TaskColumn as TaskColumnType } from '@/types/collab';
import { useTaskBoard } from './hooks/useTaskBoard';
import { useTaskDragDrop } from './hooks/useTaskDragDrop';
import { useTaskFilters } from './hooks/useTaskFilters';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import TaskCreateButton from './TaskCreateButton';
import styles from './TaskBoard.module.css';

// Define task columns
const TASK_COLUMNS: TaskColumnType[] = [
  {
    id: 'todo',
    title: 'Cần làm',
    status: 'todo',
    color: '#f0f0f0'
  },
  {
    id: 'in_process',
    title: 'Đang làm',
    status: 'in_process',
    color: '#e6f7ff'
  },
  {
    id: 'ready_for_qc',
    title: 'Chờ QC',
    status: 'ready_for_qc',
    color: '#fff7e6'
  },
  {
    id: 'done',
    title: 'Hoàn thành',
    status: 'done',
    color: '#f6ffed'
  }
];

interface TaskBoardProps {
  onTaskCreate?: (status?: Task['status']) => void;
  onTaskEdit?: (task: Task) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  onTaskCreate,
  onTaskEdit
}) => {
  const { currentProject } = useProject();

  // Custom hooks
  const { tasks, loading, error, loadTasks, moveTask } = useTaskBoard();
  const { filters, setFilters, filteredTasks, clearFilters, hasActiveFilters } = useTaskFilters(tasks);
  const { activeTask, handleDragStart, handleDragOver, handleDragEnd } = useTaskDragDrop({
    tasks: filteredTasks,
    onTaskMove: moveTask,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTaskCreate = (status: Task['status'] = 'todo') => {
    onTaskCreate?.(status);
  };

  const handleTaskEdit = (task: Task) => {
    onTaskEdit?.(task);
  };



  // Group tasks by status
  const tasksByStatus = TASK_COLUMNS.reduce((acc, column) => {
    acc[column.status] = filteredTasks.filter(task => task.status === column.status);
    return acc;
  }, {} as Record<Task['status'], Task[]>);

  if (!currentProject) {
    return (
      <Alert
        message="Chưa chọn dự án"
        description="Vui lòng chọn dự án để xem task board"
        type="info"
        showIcon
      />
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={loadTasks}>
            Thử lại
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className={styles.filtersContainer}>
        {/* Filters */}
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          tasks={tasks}
          loading={loading}
        />

        {/* Actions */}
        <div className={styles.actionsContainer}>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTasks}
            loading={loading}
            size="small"
          >
            Làm mới
          </Button>

          <TaskCreateButton
            onCreateTask={handleTaskCreate}
            loading={loading}
          />
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <Space split={<span>•</span>}>
          <span>{filteredTasks.length} task</span>
          <span>{tasksByStatus.todo?.length || 0} cần làm</span>
          <span>{tasksByStatus.in_process?.length || 0} đang làm</span>
          <span>{tasksByStatus.ready_for_qc?.length || 0} chờ QC</span>
          <span>{tasksByStatus.done?.length || 0} hoàn thành</span>
        </Space>
      </div>

      {/* Task Board */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.taskBoardGrid}>
            {TASK_COLUMNS.map(column => (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.status] || []}
                onTaskEdit={handleTaskEdit}
                onTaskCreate={handleTaskCreate}
                onTaskMove={moveTask}
                activeTaskId={activeTask?.id}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className={styles.dragOverlay}>
                <TaskCard
                  task={activeTask}
                  draggable={false}
                  isDragging={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default TaskBoard;
