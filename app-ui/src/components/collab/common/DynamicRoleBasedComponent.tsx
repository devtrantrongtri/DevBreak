'use client';

import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Select, Space, Typography, Alert, Tooltip } from 'antd';
import { EyeOutlined, SettingOutlined, LockOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface DynamicRoleBasedComponentProps {
  children: React.ReactNode;
  componentId: string; // Unique ID for this component instance
  defaultAllowedRoles?: string[]; // Default roles that can see this component
  fallback?: React.ReactNode;
  showFallback?: boolean;
  showRoleSelector?: boolean; // Show role selector for admins/PMs
  onRoleChange?: (roles: string[]) => void; // Callback when roles change
}

const PROJECT_ROLES = [
  { value: 'PM', label: 'Project Manager', color: '#ff4d4f' },
  { value: 'BC', label: 'Business Consultant', color: '#1890ff' },
  { value: 'DEV', label: 'Developer', color: '#52c41a' },
  { value: 'QC', label: 'Quality Control', color: '#fa8c16' },
  { value: 'ALL', label: 'Tất cả vai trò', color: '#722ed1' }
];

const DynamicRoleBasedComponent: React.FC<DynamicRoleBasedComponentProps> = ({
  children,
  componentId,
  defaultAllowedRoles = ['ALL'],
  fallback,
  showFallback = true,
  showRoleSelector = false,
  onRoleChange
}) => {
  const { currentProject, userRole } = useProject();
  const { hasPermission } = useAuth();
  
  // State for component's allowed roles (loaded from backend via API)
  const [allowedRoles, setAllowedRoles] = useState<string[]>(defaultAllowedRoles);

  // Check if current user can configure component visibility
  const canConfigureRoles = hasPermission('collab.projects.manage_members') || userRole === 'PM';

  // Check if current user can see this component
  const canViewComponent = () => {
    if (!currentProject || !userRole) return false;
    
    // If 'ALL' is in allowed roles, everyone can see
    if (allowedRoles.includes('ALL')) return true;
    
    // Check if user's role is in allowed roles
    return allowedRoles.includes(userRole);
  };

  // Handle role selection change
  const handleRoleChange = (newRoles: string[]) => {
    setAllowedRoles(newRoles);

    // TODO: Save to backend via API call
    // This should call the component visibility API to persist changes

    // Notify parent component
    onRoleChange?.(newRoles);
  };

  // Render role selector for admins/PMs
  const renderRoleSelector = () => {
    if (!showRoleSelector || !canConfigureRoles) return null;

    return (
      <div style={{ 
        marginBottom: 12, 
        padding: 8, 
        backgroundColor: '#f0f2f5', 
        borderRadius: 4,
        border: '1px dashed #d9d9d9'
      }}>
        <Space size="small" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space size="small">
            <SettingOutlined style={{ color: '#1890ff' }} />
            <Text style={{ fontSize: '12px', color: '#666' }}>
              Hiển thị cho:
            </Text>
          </Space>
          <Select
            mode="multiple"
            size="small"
            style={{ minWidth: 200 }}
            placeholder="Chọn vai trò..."
            value={allowedRoles}
            onChange={handleRoleChange}
            maxTagCount={2}
          >
            {PROJECT_ROLES.map(role => (
              <Option key={role.value} value={role.value}>
                <Space>
                  <div 
                    style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: role.color 
                    }} 
                  />
                  {role.label}
                </Space>
              </Option>
            ))}
          </Select>
        </Space>
      </div>
    );
  };

  // Render visibility indicator for non-admins
  const renderVisibilityIndicator = () => {
    if (canConfigureRoles || !canViewComponent()) return null;

    return (
      <div style={{ 
        marginBottom: 8, 
        padding: 4, 
        textAlign: 'right'
      }}>
        <Tooltip title={`Component này hiển thị cho: ${allowedRoles.join(', ')}`}>
          <Space size={4}>
            <EyeOutlined style={{ fontSize: '10px', color: '#999' }} />
            <Text style={{ fontSize: '10px', color: '#999' }}>
              {allowedRoles.includes('ALL') ? 'Tất cả' : allowedRoles.join(', ')}
            </Text>
          </Space>
        </Tooltip>
      </div>
    );
  };

  // Check if user can view component
  if (!canViewComponent()) {
    if (!showFallback) return null;
    
    return fallback || (
      <Alert
        message="Không có quyền xem"
        description={`Component này chỉ hiển thị cho: ${allowedRoles.join(', ')}`}
        type="warning"
        icon={<LockOutlined />}
        showIcon
        style={{ margin: '8px 0' }}
      />
    );
  }

  return (
    <div>
      {renderRoleSelector()}
      {renderVisibilityIndicator()}
      {children}
    </div>
  );
};

export default DynamicRoleBasedComponent;
