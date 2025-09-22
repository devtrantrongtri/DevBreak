'use client';

import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Empty, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface RoleBasedComponentProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  requireProject?: boolean;
}

const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  allowedRoles,
  children,
  fallback,
  showFallback = true,
  requireProject = true
}) => {
  const { currentProject, userRole } = useProject();

  // Check if project is required but not selected
  if (requireProject && !currentProject) {
    if (!showFallback) return null;
    
    return fallback || (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Vui lòng chọn dự án để tiếp tục"
      />
    );
  }

  // Check if user has role in current project
  if (!userRole) {
    if (!showFallback) return null;
    
    return fallback || (
      <Alert
        message="Không có quyền truy cập"
        description="Bạn không phải là thành viên của dự án này"
        type="warning"
        icon={<LockOutlined />}
        showIcon
      />
    );
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(userRole)) {
    if (!showFallback) return null;
    
    return fallback || (
      <Alert
        message="Không có quyền truy cập"
        description={`Chức năng này chỉ dành cho: ${allowedRoles.join(', ')}`}
        type="warning"
        icon={<LockOutlined />}
        showIcon
      />
    );
  }

  return <>{children}</>;
};

export default RoleBasedComponent;
