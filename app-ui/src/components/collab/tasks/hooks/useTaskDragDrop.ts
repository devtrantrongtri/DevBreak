'use client';

import { useState, useCallback } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task } from '@/types/collab';

export interface UseTaskDragDropReturn {
  activeTask: Task | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

interface UseTaskDragDropProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Task['status']) => Promise<void>;
  onTasksReorder?: (tasks: Task[]) => void;
}

export const useTaskDragDrop = ({
  tasks,
  onTaskMove,
  onTasksReorder,
}: UseTaskDragDropProps): UseTaskDragDropReturn => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Optional: Handle drag over for visual feedback
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over || !active) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    // Check if dropping on a column
    if (over.id.toString().startsWith('column-')) {
      const newStatus = over.id.toString().replace('column-', '') as Task['status'];

      if (task.status !== newStatus) {
        try {
          await onTaskMove(taskId, newStatus);
        } catch (error) {
          console.error('Failed to move task:', error);
        }
      }
      return;
    }

    // Check if reordering within same column
    if (active.id !== over.id) {
      const activeIndex = tasks.findIndex(t => t.id === active.id);
      const overIndex = tasks.findIndex(t => t.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];
        
        // Only reorder if in same status
        if (activeTask.status === overTask.status) {
          const newTasks = arrayMove(tasks, activeIndex, overIndex);
          onTasksReorder?.(newTasks);
        }
      }
    }
  }, [tasks, onTaskMove, onTasksReorder]);

  return {
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};
