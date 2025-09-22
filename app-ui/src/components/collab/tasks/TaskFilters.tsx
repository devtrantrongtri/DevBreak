'use client';

import React from 'react';
import { Space, Input, Select, Button, Badge, Tooltip } from 'antd';
import { SearchOutlined, ClearOutlined, FilterOutlined } from '@ant-design/icons';
import { Task } from '@/types/collab';
import { TaskFilters as TaskFiltersType } from './hooks/useTaskFilters';

const { Search } = Input;
const { Option } = Select;

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: Partial<TaskFiltersType>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  tasks: Task[];
  loading?: boolean;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  tasks,
  loading = false,
}) => {
  // Get unique assignees
  const assignees = React.useMemo(() => {
    const uniqueAssignees = new Map();
    tasks.forEach(task => {
      if (task.assignee && !uniqueAssignees.has(task.assigneeId)) {
        uniqueAssignees.set(task.assigneeId, task.assignee);
      }
    });
    return Array.from(uniqueAssignees.values());
  }, [tasks]);

  return (
    <div style={{ 
      padding: '16px 0',
      borderBottom: '1px solid #f0f0f0',
      marginBottom: 16
    }}>
      <Space wrap size="middle">
        {/* Search */}
        <Search
          placeholder="Tìm kiếm task..."
          value={filters.searchText}
          onChange={(e) => onFiltersChange({ searchText: e.target.value })}
          style={{ width: 250 }}
          size="small"
          allowClear
        />

        {/* Assignee Filter */}
        <Select
          value={filters.assigneeId}
          onChange={(value) => onFiltersChange({ assigneeId: value })}
          style={{ width: 150 }}
          size="small"
          placeholder="Người thực hiện"
        >
          <Option value="all">Tất cả</Option>
          <Option value="unassigned">Chưa assign</Option>
          {assignees.map(assignee => (
            <Option key={assignee.id} value={assignee.id}>
              {assignee.displayName}
            </Option>
          ))}
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onChange={(value) => onFiltersChange({ priority: value })}
          style={{ width: 120 }}
          size="small"
          placeholder="Mức độ"
        >
          <Option value="all">Tất cả mức độ</Option>
          <Option value="urgent">Khẩn cấp</Option>
          <Option value="high">Cao</Option>
          <Option value="medium">Trung bình</Option>
          <Option value="low">Thấp</Option>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onChange={(value) => onFiltersChange({ status: value })}
          style={{ width: 120 }}
          size="small"
          placeholder="Trạng thái"
        >
          <Option value="all">Tất cả</Option>
          <Option value="todo">Cần làm</Option>
          <Option value="in_process">Đang làm</Option>
          <Option value="ready_for_qc">Chờ QC</Option>
          <Option value="done">Hoàn thành</Option>
        </Select>

        {/* Overdue Filter */}
        <Button
          type={filters.overdue ? 'primary' : 'default'}
          size="small"
          onClick={() => onFiltersChange({ overdue: !filters.overdue })}
          danger={filters.overdue}
        >
          Quá hạn
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Tooltip title="Xóa bộ lọc">
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={onClearFilters}
            >
              Xóa bộ lọc
            </Button>
          </Tooltip>
        )}

        {/* Filter Indicator */}
        {hasActiveFilters && (
          <Badge count={1} size="small">
            <FilterOutlined style={{ color: '#1890ff' }} />
          </Badge>
        )}
      </Space>
    </div>
  );
};

export default TaskFilters;
