'use client';

import React, { useState } from 'react';
import { Row, Col, Typography, Space, Button, Modal } from 'antd';
import { ProjectOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { DashboardSection } from '@/types/collab';
import DashboardCard from './DashboardCard';
import RoleBasedComponent from '../common/RoleBasedComponent';
import DailyReportsSection from '../dailies/DailyReportsSection';
import TaskBoard from '../tasks/TaskBoard';
import ProjectSelector from '../layout/ProjectSelector';
import EmptyProjectState from '../projects/EmptyProjectState';
import CreateTaskModal from '../tasks/CreateTaskModal';
import EditTaskModal from '../tasks/EditTaskModal';
import CreateDailyModal from '../dailies/CreateDailyModal';
import ProjectMembersModal from '../projects/ProjectMembersModal';
import VisibilityWrapper from '../common/VisibilityWrapper';
import ProjectVisibilityControl from './ProjectVisibilityControl';
import ProjectMeetings from '../../meetings/ProjectMeetings';
import PMDailyReportWrapper from './PMDailyReportWrapper';
import CreateProjectModal from '../projects/CreateProjectModal';
import PermissionBasedComponent from '../common/PermissionBasedComponent';

const { Title } = Typography;

// Define dashboard sections based on user roles
const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: 'pm-daily-dashboard',
    title: 'PM Daily Dashboard',
    component: PMDailyReportWrapper,
    roles: ['PM'], // Default roles, but can be overridden by component visibility settings
    span: 2
  },
  {
    id: 'daily-reports',
    title: 'Daily Reports',
    component: DailyReportsSection,
    roles: ['PM', 'BC', 'DEV', 'QC'],
    span: 1
  },
  {
    id: 'meetings',
    title: 'Project Meetings',
    component: ({ projectId, projectName }: { projectId: string; projectName?: string }) => (
      <ProjectMeetings projectId={projectId} projectName={projectName} />
    ),
    roles: ['PM', 'BC', 'DEV', 'QC'],
    span: 1
  },
  {
    id: 'task-board',
    title: 'Bảng công việc',
    component: TaskBoard,
    roles: ['PM', 'BC', 'DEV', 'QC'],
    span: 2
  }
];

const CollabDashboard: React.FC = () => {
  const { currentProject, userRole, loading, projects, projectsLoading } = useProject();
  const [createTaskModalVisible, setCreateTaskModalVisible] = useState(false);
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
  const [createDailyModalVisible, setCreateDailyModalVisible] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [createProjectModalVisible, setCreateProjectModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskInitialStatus, setTaskInitialStatus] = useState<'todo' | 'in_process' | 'ready_for_qc' | 'done'>('todo');
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);

  // Filter sections based on user role
  const visibleSections = DASHBOARD_SECTIONS.filter(section => 
    userRole && section.roles.includes(userRole)
  );

  const handleTaskCreate = (status?: 'todo' | 'in_process' | 'ready_for_qc' | 'done') => {
    setTaskInitialStatus(status || 'todo');
    setCreateTaskModalVisible(true);
  };

  const handleTaskEdit = (task: any) => {
    setSelectedTask(task);
    setEditTaskModalVisible(true);
  };

  const handleDailyCreate = () => {
    setCreateDailyModalVisible(true);
  };

  if (loading || projectsLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <Space direction="vertical" align="center">
          <ProjectOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
          <span>Đang tải...</span>
        </Space>
      </div>
    );
  }

  // Show empty state if no projects exist
  if (projects.length === 0) {
    return <EmptyProjectState />;
  }

  // Show project selector if projects exist but none selected
  if (!currentProject) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: 24
      }}>
        <Space direction="vertical" align="center" size="large">
          <ProjectOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
          <div style={{ textAlign: 'center' }}>
            <Title level={4} type="secondary">
              Chào mừng đến với Collab Hub
            </Title>
            <p style={{ color: '#999', marginBottom: 24 }}>
              Vui lòng chọn dự án để bắt đầu làm việc
            </p>
            <ProjectSelector size="large" />
          </div>
        </Space>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Dashboard Header */}
      <div style={{ 
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ProjectOutlined style={{ color: '#1890ff' }} />
            {currentProject.name}
          </Title>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            {currentProject.description || `Mã dự án: ${currentProject.code}`}
          </p>
        </div>

        <Space>
          <RoleBasedComponent allowedRoles={['PM']} showFallback={false}>
            <Button
              type="default"
              icon={<TeamOutlined />}
              onClick={() => setMembersModalVisible(true)}
            >
              Quản lý thành viên
            </Button>
          </RoleBasedComponent>
        </Space>

        <Space>
          <PermissionBasedComponent requiredPermissions={['collab.projects.create']}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateProjectModalVisible(true)}
            >
              Tạo dự án mới
            </Button>
          </PermissionBasedComponent>
        </Space>

        <Space>
          <ProjectVisibilityControl />

          <RoleBasedComponent allowedRoles={['PM', 'BC']} showFallback={false}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleTaskCreate()}
            >
              Tạo Task Mới
            </Button>
          </RoleBasedComponent>
        </Space>
      </div>

      {/* Dashboard Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 20
      }}>
        {visibleSections.map(section => {
          const SectionComponent = section.component;
          
          return (
            <div
              key={section.id}
              style={{
                gridColumn: section.span === 2 ? 'span 2' : 'span 1'
              }}
              className={`dashboard-section ${section.span === 2 ? 'span-2' : ''}`}
            >
              <VisibilityWrapper componentKey={section.id}>
                <DashboardCard
                  title={section.title}
                  span={section.span}
                  componentKey={section.id}
                  onRefresh={() => {
                    // Implement refresh logic for each section
                    console.log(`Refreshing ${section.id}`);
                  }}
                >
                  <SectionComponent
                    projectId={currentProject?.id}
                    projectName={currentProject?.name}
                    onTaskCreate={handleTaskCreate}
                    onTaskEdit={handleTaskEdit}
                    onCreateDaily={handleDailyCreate}
                    refreshTrigger={section.id === 'task-board' ? taskRefreshTrigger : undefined}
                    {...(section.props || {})}
                  />
                </DashboardCard>
              </VisibilityWrapper>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <Modal
        title="Tạo Task Mới"
        open={createTaskModalVisible}
        onCancel={() => setCreateTaskModalVisible(false)}
        footer={null}
        width={600}
      >
        {/* CreateTaskModal component would go here */}
        <div style={{ padding: '20px 0' }}>
          <p>CreateTaskModal component sẽ được implement ở đây</p>
        </div>
      </Modal>

      <CreateTaskModal
        visible={createTaskModalVisible}
        onCancel={() => setCreateTaskModalVisible(false)}
        onSuccess={() => {
          setCreateTaskModalVisible(false);
          // Trigger refresh of TaskBoard
          setTaskRefreshTrigger(prev => prev + 1);
        }}
        initialStatus={taskInitialStatus}
      />

      <CreateDailyModal
        visible={createDailyModalVisible}
        onCancel={() => setCreateDailyModalVisible(false)}
        onSuccess={() => {
          // Refresh dailies when implemented
        }}
      />

      <EditTaskModal
        visible={editTaskModalVisible}
        task={selectedTask}
        onCancel={() => {
          setEditTaskModalVisible(false);
          setSelectedTask(null);
        }}
        onSuccess={() => {
          setEditTaskModalVisible(false);
          setSelectedTask(null);
          // Trigger refresh of TaskBoard
          setTaskRefreshTrigger(prev => prev + 1);
        }}
        onDelete={(taskId) => {
          setEditTaskModalVisible(false);
          setSelectedTask(null);
          // Trigger refresh of TaskBoard after deletion
          setTaskRefreshTrigger(prev => prev + 1);
        }}
      />

      {currentProject && (
        <ProjectMembersModal
          visible={membersModalVisible}
          onCancel={() => setMembersModalVisible(false)}
          projectId={currentProject.id}
        />
      )}

      <CreateProjectModal
        visible={createProjectModalVisible}
        onCancel={() => setCreateProjectModalVisible(false)}
        onSuccess={() => {
          setCreateProjectModalVisible(false);
          // Modal will auto close and refresh projects
        }}
      />
    </div>
  );
};

export default CollabDashboard;
