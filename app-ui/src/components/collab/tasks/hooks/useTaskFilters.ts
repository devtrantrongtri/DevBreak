'use client';

import { useState, useMemo } from 'react';
import { Task } from '@/types/collab';

export interface TaskFilters {
  searchText: string;
  assigneeId: string;
  priority: string;
  status: string;
  overdue: boolean;
}

export interface UseTaskFiltersReturn {
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  filteredTasks: Task[];
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: TaskFilters = {
  searchText: '',
  assigneeId: 'all',
  priority: 'all',
  status: 'all',
  overdue: false,
};

export const useTaskFilters = (tasks: Task[]): UseTaskFiltersReturn => {
  const [filters, setFiltersState] = useState<TaskFilters>(DEFAULT_FILTERS);

  const setFilters = (newFilters: Partial<TaskFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchText !== '' ||
      filters.assigneeId !== 'all' ||
      filters.priority !== 'all' ||
      filters.status !== 'all' ||
      filters.overdue
    );
  }, [filters]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search text filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.assignee?.displayName.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Assignee filter
      if (filters.assigneeId !== 'all') {
        if (filters.assigneeId === 'unassigned') {
          if (task.assigneeId) return false;
        } else {
          if (task.assigneeId !== filters.assigneeId) return false;
        }
      }

      // Priority filter
      if (filters.priority !== 'all') {
        if (task.priority !== filters.priority) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        if (task.status !== filters.status) return false;
      }

      // Overdue filter
      if (filters.overdue) {
        if (!task.dueDate) return false;
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        if (dueDate >= now) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  return {
    filters,
    setFilters,
    filteredTasks,
    clearFilters,
    hasActiveFilters,
  };
};
