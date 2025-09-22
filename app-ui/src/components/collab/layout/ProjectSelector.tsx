'use client';

import React from 'react';
import { Select, Space, Typography, Avatar, Spin, Tag } from 'antd';
import { ProjectOutlined, TeamOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { PROJECT_ROLES, PROJECT_STATUSES } from '@/types/collab';

const { Text } = Typography;
const { Option } = Select;

interface ProjectSelectorProps {
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ 
  style,
  size = 'middle'
}) => {
  const { 
    currentProject, 
    userRole, 
    projects, 
    loading, 
    projectsLoading, 
    switchProject 
  } = useProject();

  const handleProjectChange = (projectId: string) => {
    switchProject(projectId);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      PM: 'red',
      BC: 'blue',
      DEV: 'green',
      QC: 'orange'
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      inactive: 'warning',
      completed: 'default',
      archived: 'default'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  if (projectsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', ...style }}>
        <Spin size="small" />
        <Text style={{ marginLeft: 8 }}>Đang tải dự án...</Text>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', ...style }}>
        <ProjectOutlined style={{ color: '#999' }} />
        <Text type="secondary" style={{ marginLeft: 8 }}>
          Chưa có dự án nào
        </Text>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...style }}>
      <Select
        value={currentProject?.id}
        onChange={handleProjectChange}
        loading={loading}
        style={{ minWidth: 200 }}
        size={size}
        placeholder="Chọn dự án"
        optionLabelProp="label"
      >
        {projects.map(project => (
          <Option 
            key={project.id} 
            value={project.id}
            label={
              <Space>
                <ProjectOutlined />
                <Text strong>{project.name}</Text>
              </Space>
            }
          >
            <div style={{ padding: '4px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <ProjectOutlined />
                  <Text strong>{project.name}</Text>
                </Space>
                <Tag color={getStatusColor(project.status)} size="small">
                  {PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES]}
                </Tag>
              </div>
              
              <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                <Space split={<span>•</span>}>
                  <span>Mã: {project.code}</span>
                  <Space>
                    <TeamOutlined />
                    <span>{project.memberCount} thành viên</span>
                  </Space>
                </Space>
              </div>
              
              {project.description && (
                <div style={{ 
                  marginTop: 4, 
                  fontSize: '12px', 
                  color: '#999',
                  maxWidth: 300,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {project.description}
                </div>
              )}
            </div>
          </Option>
        ))}
      </Select>

      {currentProject && userRole && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Vai trò:
          </Text>
          <Tag color={getRoleColor(userRole)} size="small">
            {PROJECT_ROLES[userRole as keyof typeof PROJECT_ROLES]}
          </Tag>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
