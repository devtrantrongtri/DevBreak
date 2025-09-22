'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectMember } from '@/types/collab';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { message } from 'antd';

interface ProjectContextType {
  // Current project state
  currentProject: Project | null;
  userRole: string | null;
  projects: Project[];
  
  // Loading states
  loading: boolean;
  projectsLoading: boolean;
  
  // Actions
  switchProject: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshCurrentProject: () => Promise<void>;
  
  // Helper methods
  isProjectMember: (projectId: string) => boolean;
  getUserRole: (projectId: string) => string | null;
  canPerformAction: (action: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Load projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshProjects();
    }
  }, [isAuthenticated, user]);

  // Auto-select first project if none selected
  useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      const savedProjectId = localStorage.getItem('collab_current_project');
      const projectToSelect = savedProjectId 
        ? projects.find(p => p.id === savedProjectId) || projects[0]
        : projects[0];
      
      if (projectToSelect) {
        switchProject(projectToSelect.id);
      }
    }
  }, [projects, currentProject]);

  const refreshProjects = async () => {
    if (!user) return;
    
    try {
      setProjectsLoading(true);
      const response = await apiClient.request<Project[]>('/collab/projects');
      setProjects(response);
    } catch (error) {
      console.error('Failed to load projects:', error);
      message.error('Không thể tải danh sách dự án');
    } finally {
      setProjectsLoading(false);
    }
  };

  const refreshCurrentProject = async () => {
    if (!currentProject) return;
    
    try {
      const response = await apiClient.request<Project>(`/collab/projects/${currentProject.id}`);
      setCurrentProject(response);
      updateUserRole(response);
    } catch (error) {
      console.error('Failed to refresh current project:', error);
      message.error('Không thể tải thông tin dự án');
    }
  };

  const switchProject = async (projectId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiClient.request<Project>(`/collab/projects/${projectId}`);
      setCurrentProject(response);
      updateUserRole(response);
      
      // Save to localStorage
      localStorage.setItem('collab_current_project', projectId);
    } catch (error) {
      console.error('Failed to switch project:', error);
      message.error('Không thể chuyển dự án');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = (project: Project) => {
    if (!user) return;
    
    const member = project.members.find(m => m.userId === user.id && m.isActive);
    setUserRole(member?.role || null);
  };

  const isProjectMember = (projectId: string): boolean => {
    if (!user) return false;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    
    return project.members.some(m => m.userId === user.id && m.isActive);
  };

  const getUserRole = (projectId: string): string | null => {
    if (!user) return null;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const member = project.members.find(m => m.userId === user.id && m.isActive);
    return member?.role || null;
  };

  const canPerformAction = (action: string): boolean => {
    if (!userRole) return false;
    
    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      PM: [
        'create_project', 'update_project', 'delete_project', 'manage_members',
        'create_task', 'update_task', 'delete_task', 'assign_task',
        'view_all_dailies', 'view_summary'
      ],
      BC: [
        'create_task', 'update_task',
        'create_daily', 'update_daily', 'view_dailies'
      ],
      DEV: [
        'update_assigned_task',
        'create_daily', 'update_daily', 'view_dailies'
      ],
      QC: [
        'update_qc_task',
        'create_daily', 'update_daily', 'view_dailies'
      ]
    };
    
    return rolePermissions[userRole]?.includes(action) || false;
  };

  const value: ProjectContextType = {
    currentProject,
    userRole,
    projects,
    loading,
    projectsLoading,
    switchProject,
    refreshProjects,
    refreshCurrentProject,
    isProjectMember,
    getUserRole,
    canPerformAction,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
