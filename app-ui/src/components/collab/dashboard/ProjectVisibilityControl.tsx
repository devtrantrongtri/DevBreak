'use client';

import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Space, Tooltip, App } from 'antd';
import { EyeOutlined, SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';

interface ComponentVisibility {
  id: string;
  componentKey: string;
  isVisibleToAll: boolean;
  visibleRoles: string[] | null;
}

const ProjectVisibilityControl: React.FC = () => {
  const { currentProject, userRole } = useProject();
  const [loading, setLoading] = useState(false);
  const [visibilitySettings, setVisibilitySettings] = useState<ComponentVisibility[]>([]);
  const { message, modal } = App.useApp();

  const isPM = userRole === 'PM';

  // Load visibility settings
  useEffect(() => {
    if (currentProject && isPM) {
      loadVisibilitySettings();
    }
  }, [currentProject, isPM]);

  const loadVisibilitySettings = async () => {
    if (!currentProject) return;

    try {
      setLoading(true);
      const response = await apiClient.request<ComponentVisibility[]>(
        `/collab/projects/${currentProject.id}/component-visibility`
      );
      setVisibilitySettings(response);
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      console.error('Failed to load visibility settings:', error);
      // Don't show error message for 404 - means no custom settings
      if (!error?.message?.includes('404')) {
        message.error('Không thể tải cài đặt hiển thị');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAllToDefault = async () => {
    if (!currentProject) return;

    modal.confirm({
      title: 'Reset tất cả về mặc định?',
      content: 'Tất cả components sẽ hiển thị cho tất cả roles. Bạn có chắc chắn?',
      okText: 'Reset',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          
          // Reset each component
          const components = ['daily-reports', 'task-board', 'summary'];
          for (const componentKey of components) {
            try {
              await apiClient.request(`/collab/projects/${currentProject.id}/component-visibility`, {
                method: 'DELETE',
                data: { componentKey }
              });
            } catch (error) {
              // Ignore 404 errors - component might not have custom settings
              console.log(`Component ${componentKey} already at default`);
            }
          }

          setVisibilitySettings([]);
          message.success('Đã reset tất cả components về mặc định (hiển thị cho tất cả)');

          // Force refresh page to update all components
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (err: unknown) {
          const error = err as Error & { message?: string };
          console.error('Failed to reset visibility:', error);
          message.error(`Lỗi reset: ${error?.message || 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getVisibilityStatus = () => {
    if (visibilitySettings.length === 0) {
      return 'Tất cả hiển thị cho mọi role';
    }
    
    const customCount = visibilitySettings.filter(v => !v.isVisibleToAll).length;
    if (customCount === 0) {
      return 'Tất cả hiển thị cho mọi role';
    }
    
    return `${customCount} component có cài đặt riêng`;
  };

  // Don't show if user is not PM
  if (!isPM || !currentProject) {
    return null;
  }

  const menuItems = [
    {
      key: 'status',
      label: (
        <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Trạng thái hiển thị:</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {getVisibilityStatus()}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'reset',
      label: (
        <Space>
          <ReloadOutlined />
          Reset tất cả về mặc định
        </Space>
      ),
      onClick: resetAllToDefault,
    },
  ];

  return (
    <Tooltip title="Quản lý hiển thị components (PM only)">
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          size="small"
          icon={<SettingOutlined />}
          loading={loading}
          style={{ padding: '4px 8px' }}
        >
          Visibility
        </Button>
      </Dropdown>
    </Tooltip>
  );
};

export default ProjectVisibilityControl;
