'use client';

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { Task } from '@/types/collab';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';

export interface UseTaskBoardReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  moveTask: (taskId: string, newStatus: Task['status']) => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export const useTaskBoard = (): UseTaskBoardReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentProject } = useProject();

  const loadTasks = useCallback(async () => {
    if (!currentProject) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.request<Task[]>(
        `/collab/tasks?projectId=${currentProject.id}`
      );
      
      setTasks(response || []);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      setError(err.message || 'Không thể tải danh sách task');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await apiClient.request<Task>(
        `/collab/tasks/${taskId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }
      );

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...response } : task
      ));

      message.success('Cập nhật task thành công');
    } catch (err: any) {
      console.error('Failed to update task:', err);
      message.error(err.message || 'Không thể cập nhật task');
      throw err;
    }
  }, []);

  const moveTask = useCallback(async (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      // Revert on error
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: task.status } : t
      ));
      throw err;
    }
  }, [tasks, updateTask]);

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    if (!currentProject) return;

    try {
      const response = await apiClient.request<Task>(
        '/collab/tasks',
        {
          method: 'POST',
          body: JSON.stringify({
            ...taskData,
            projectId: currentProject.id,
          }),
        }
      );

      setTasks(prev => [...prev, response]);
      message.success('Tạo task thành công');
    } catch (err: any) {
      console.error('Failed to create task:', err);
      message.error(err.message || 'Không thể tạo task');
      throw err;
    }
  }, [currentProject]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await apiClient.request(`/collab/tasks/${taskId}`, {
        method: 'DELETE',
      });

      setTasks(prev => prev.filter(task => task.id !== taskId));
      message.success('Xóa task thành công');
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      message.error(err.message || 'Không thể xóa task');
      throw err;
    }
  }, []);

  // Load tasks when project changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    updateTask,
    moveTask,
    createTask,
    deleteTask,
  };
};
