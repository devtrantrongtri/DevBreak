'use client';

import React, { useState, useEffect } from 'react';
import { Switch, Select, Button, Space, Tooltip, App } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';

const { Option } = Select;

interface ComponentVisibilityControlProps {
  componentKey: string; // 'daily-reports', 'task-board', 'summary'
  onVisibilityChange?: (isVisible: boolean) => void;
}

interface ComponentVisibility {
  id: string;
  componentKey: string;
  isVisibleToAll: boolean;
  visibleRoles: string[] | null;
}

const ComponentVisibilityControl: React.FC<ComponentVisibilityControlProps> = ({
  componentKey,
  onVisibilityChange
}) => {
  const { currentProject, userRole } = useProject();
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<ComponentVisibility | null>(null);
  const [isVisibleToAll, setIsVisibleToAll] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { message } = App.useApp();

  const isPM = userRole === 'PM';
  const availableRoles = ['PM', 'BC', 'DEV', 'QC'];

  // Load current visibility settings
  useEffect(() => {
    if (currentProject && isPM) {
      loadVisibilitySettings();
    }
  }, [currentProject, componentKey, isPM]);

  const loadVisibilitySettings = async () => {
    if (!currentProject) return;

    console.log(`[ComponentVisibilityControl] Loading settings for project: ${currentProject.id}, component: ${componentKey}, userRole: ${userRole}`);

    try {
      setLoading(true);
      const response = await apiClient.request<ComponentVisibility[]>(
        `/collab/projects/${currentProject.id}/component-visibility`
      );

      console.log(`[ComponentVisibilityControl] Loaded ${response.length} visibility settings:`, response);
      
      const componentVisibility = response.find(v => v.componentKey === componentKey);
      if (componentVisibility) {
        setVisibility(componentVisibility);
        setIsVisibleToAll(componentVisibility.isVisibleToAll);
        setSelectedRoles(componentVisibility.visibleRoles || []);
      } else {
        // Default: visible to all
        setIsVisibleToAll(true);
        setSelectedRoles([]);
      }
    } catch (error: any) {
      console.error('Failed to load visibility settings:', error);
      // Don't show error for 404 - means no custom settings exist
      if (!error?.message?.includes('404')) {
        console.warn('Could not load visibility settings:', error?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateVisibility = async (newIsVisibleToAll: boolean, newRoles?: string[]) => {
    if (!currentProject) return;

    try {
      setLoading(true);
      
      await apiClient.request(`/collab/projects/${currentProject.id}/component-visibility`, {
        method: 'POST',
        data: {
          componentKey,
          isVisibleToAll: newIsVisibleToAll,
          visibleRoles: newIsVisibleToAll ? null : (newRoles || selectedRoles)
        }
      });

      setIsVisibleToAll(newIsVisibleToAll);
      if (!newIsVisibleToAll && newRoles) {
        setSelectedRoles(newRoles);
      }

      message.success('Visibility settings updated');
      onVisibilityChange?.(newIsVisibleToAll || (newRoles || selectedRoles).includes(userRole || ''));
      
      // Reload to get updated data
      loadVisibilitySettings();
    } catch (error: any) {
      console.error('Failed to update visibility:', error);
      message.error(`Failed to update visibility: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = async () => {
    if (!currentProject) return;

    try {
      setLoading(true);
      
      await apiClient.request(`/collab/projects/${currentProject.id}/component-visibility`, {
        method: 'DELETE',
        data: {
          componentKey
        }
      });

      setIsVisibleToAll(true);
      setSelectedRoles([]);
      setVisibility(null);

      message.success('Visibility reset to default (visible to all)');
      onVisibilityChange?.(true);

      // Force refresh to update component visibility
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Failed to reset visibility:', error);
      message.error(`Failed to reset visibility: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Don't show controls if user is not PM
  if (!isPM) {
    return null;
  }

  return (
    <Space size="small">
      <Tooltip title={isVisibleToAll ? 'Visible to all roles' : 'Visible to selected roles only'}>
        <Switch
          size="small"
          checked={isVisibleToAll}
          onChange={(checked) => updateVisibility(checked)}
          loading={loading}
          checkedChildren={<EyeOutlined />}
          unCheckedChildren={<EyeInvisibleOutlined />}
        />
      </Tooltip>

      {!isVisibleToAll && (
        <Select
          mode="multiple"
          size="small"
          style={{ minWidth: 120 }}
          placeholder="Select roles"
          value={selectedRoles}
          onChange={(roles) => updateVisibility(false, roles)}
          loading={loading}
        >
          {availableRoles.map(role => (
            <Option key={role} value={role}>{role}</Option>
          ))}
        </Select>
      )}

      <Tooltip title="Reset to default (visible to all)">
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={resetToDefault}
          loading={loading}
          style={{ padding: '4px' }}
        />
      </Tooltip>
    </Space>
  );
};

export default ComponentVisibilityControl;
