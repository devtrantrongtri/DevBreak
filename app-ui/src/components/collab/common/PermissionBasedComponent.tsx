'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, Empty } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface PermissionBasedComponentProps {
  requiredPermissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  requireAll?: boolean; // true = require ALL permissions, false = require ANY permission
}

const PermissionBasedComponent: React.FC<PermissionBasedComponentProps> = ({
  requiredPermissions,
  children,
  fallback,
  showFallback = true,
  requireAll = false
}) => {
  const { user, hasPermission } = useAuth();

  // Check if user is authenticated
  if (!user) {
    if (!showFallback) return null;
    
    return fallback || (
      <Alert
        message="Chưa đăng nhập"
        description="Vui lòng đăng nhập để tiếp tục"
        type="warning"
        icon={<LockOutlined />}
        showIcon
      />
    );
  }

  // Check permissions
  const hasRequiredPermissions = requireAll
    ? requiredPermissions.every(permission => hasPermission(permission))
    : requiredPermissions.some(permission => hasPermission(permission));

  if (!hasRequiredPermissions) {
    if (!showFallback) return null;
    
    return fallback || (
      <Alert
        message="Không có quyền truy cập"
        description={`Chức năng này yêu cầu quyền: ${requiredPermissions.join(', ')}`}
        type="warning"
        icon={<LockOutlined />}
        showIcon
      />
    );
  }

  return <>{children}</>;
};

export default PermissionBasedComponent;
