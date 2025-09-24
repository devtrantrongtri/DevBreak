'use client';

import React, { useState, useEffect, useRef } from 'react';
import { List, Typography, Spin, Empty } from 'antd';

import { Task, TASK_STATUSES } from '@/types/collab';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';
import './TaskMentionAutocomplete.scss';

const { Text } = Typography;

interface TaskMentionAutocompleteProps {
  query: string;
  onSelect: (task: Task) => void;
  onClose: () => void;
  visible: boolean;
  position: { top: number; left: number };
}

const TaskMentionAutocomplete: React.FC<TaskMentionAutocompleteProps> = ({
  query,
  onSelect,
  onClose,
  visible,
  position
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { currentProject } = useProject();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      loadProjectTasks(query);
    } else {
      setTasks([]);
    }
  }, [query, visible, currentProject]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, tasks.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (tasks[selectedIndex]) {
            onSelect(tasks[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, tasks, selectedIndex, onSelect, onClose]);

  const loadProjectTasks = async (searchQuery: string) => {
    if (!currentProject) return;

    try {
      setLoading(true);

      // Load all tasks from current project
      const allTasks = await apiClient.request<Task[]>(`/collab/tasks?projectId=${currentProject.id}`);

      // Filter tasks based on search query if provided
      let filteredTasks = allTasks;
      if (searchQuery && searchQuery.trim().length > 0) {
        const query = searchQuery.trim().toLowerCase();
        filteredTasks = allTasks.filter(task =>
          task.title.toLowerCase().includes(query) ||
          (task.code && task.code.toLowerCase().includes(query)) ||
          (task.description && task.description.toLowerCase().includes(query))
        );
      }

      setTasks(filteredTasks.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Failed to load project tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      todo: '#d9d9d9',
      in_process: '#1890ff',
      ready_for_qc: '#faad14',
      done: '#52c41a'
    };
    return colors[status as keyof typeof colors] || '#d9d9d9';
  };







  if (!visible) return null;

  return (
    <div
      className="task-mention-autocomplete"
      style={{
        position: 'absolute',
        top: position.top + 25, // Offset below cursor
        left: position.left,
        zIndex: 1000,
        minWidth: '300px',
        maxWidth: '400px'
      }}
      ref={listRef}
    >
      <div className="autocomplete-content">
        {loading ? (
          <div className="loading-container">
            <Spin size="small" />
            <Text type="secondary" style={{ marginLeft: 8 }}>
              Đang tìm kiếm...
            </Text>
          </div>
        ) : tasks.length > 0 ? (
          <List
            size="small"
            dataSource={tasks}
            renderItem={(task, index) => (
              <List.Item
                key={task.id}
                className={`task-item ${index === selectedIndex ? 'selected' : ''}`}
                style={{ cursor: 'pointer', padding: '8px 12px' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(task);
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(task.status),
                        marginTop: '6px'
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text strong style={{ fontSize: '13px', color: '#1890ff' }}>
                        {task.code || task.title.substring(0, 15)}
                      </Text>
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        {task.title.length > 35 ? `${task.title.substring(0, 35)}...` : task.title}
                      </Text>
                    </div>
                  }
                  description={
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                      {TASK_STATUSES[task.status as keyof typeof TASK_STATUSES] || task.status}
                      {task.assignee && ` • ${task.assignee.displayName}`}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="empty-container">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Không tìm thấy task nào
                </Text>
              }
            />
          </div>
        )}
        
        {tasks.length > 0 && (
          <div className="autocomplete-footer">
            <Text type="secondary" style={{ fontSize: '11px' }}>
              ↑↓ để chọn, Enter để xác nhận, Esc để đóng
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskMentionAutocomplete;
