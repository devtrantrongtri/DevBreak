'use client';

import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import { Task } from '@/types/collab';
import { useProject } from '@/contexts/ProjectContext';

interface TaskCreateButtonProps {
  onCreateTask: (status?: Task['status']) => void;
  loading?: boolean;
}

const TaskCreateButton: React.FC<TaskCreateButtonProps> = ({
  onCreateTask,
  loading = false,
}) => {
  const { canPerformAction } = useProject();

  const canCreateTask = canPerformAction('create_task');

  if (!canCreateTask) {
    return null;
  }

  const menuItems = [
    {
      key: 'todo',
      label: 'Cần làm',
      onClick: () => onCreateTask('todo'),
    },
    {
      key: 'in_process',
      label: 'Đang làm',
      onClick: () => onCreateTask('in_process'),
    },
    {
      key: 'ready_for_qc',
      label: 'Chờ QC',
      onClick: () => onCreateTask('ready_for_qc'),
    },
    {
      key: 'done',
      label: 'Hoàn thành',
      onClick: () => onCreateTask('done'),
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomLeft"
    >
      <Button
        type="primary"
        size="small"
        loading={loading}
        icon={<PlusOutlined />}
      >
        <Space>
          Tạo Task
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default TaskCreateButton;
