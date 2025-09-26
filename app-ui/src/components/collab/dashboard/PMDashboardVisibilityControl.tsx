'use client';

import React, { useState, useEffect } from 'react';
import { Card, Switch, Select, Space, Typography, Alert, Button, App } from 'antd';
import { SettingOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface ComponentVisibility {
  id: string;
  componentKey: string;
  isVisibleToAll: boolean;
  visibleRoles: string[] | null;
}

const PMDashboardVisibilityControl: React.FC = () => {
  const { message } = App.useApp();
  const { currentProject, userRole } = useProject();
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<ComponentVisibility | null>(null);
  const [isVisibleToAll, setIsVisibleToAll] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['PM']);

  const availableRoles = ['PM', 'BC', 'DEV', 'QC'];
  const componentKey = 'pm-daily-dashboard';

  useEffect(() => {
    if (currentProject) {
      loadVisibilitySettings();
    }
  }, [currentProject]);

  const loadVisibilitySettings = async () => {
    if (!currentProject) return;

    try {
      setLoading(true);
      const response = await apiClient.request<ComponentVisibility[]>(
        `/collab/projects/${currentProject.id}/component-visibility`
      );
      
      const pmDashboardVisibility = response.find(v => v.componentKey === componentKey);
      
      if (pmDashboardVisibility) {
        setVisibility(pmDashboardVisibility);
        setIsVisibleToAll(pmDashboardVisibility.isVisibleToAll);
        setSelectedRoles(pmDashboardVisibility.visibleRoles || ['PM']);
      } else {
        // Default settings
        setIsVisibleToAll(false);
        setSelectedRoles(['PM']);
      }
    } catch (error) {
      console.error('Failed to load visibility settings:', error);
      message.error('Không thể tải cài đặt hiển thị');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentProject) return;

    try {
      setLoading(true);
      await apiClient.updateComponentVisibility(
        currentProject.id,
        componentKey,
        {
          isVisibleToAll,
          visibleRoles: isVisibleToAll ? undefined : selectedRoles
        }
      );
      
      message.success('Cài đặt hiển thị đã được cập nhật');
      await loadVisibilitySettings(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to update visibility settings:', error);
      message.error('Không thể cập nhật cài đặt hiển thị');
    } finally {
      setLoading(false);
    }
  };

  // Only PM can manage visibility settings
  if (userRole !== 'PM') {
    return null;
  }

  if (!currentProject) {
    return (
      <Alert
        message="Vui lòng chọn dự án để quản lý cài đặt hiển thị"
        type="info"
        showIcon
      />
    );
  }

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          <span>Cài đặt hiển thị PM Daily Dashboard</span>
        </Space>
      }
      size="small"
      loading={loading}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          message="Quản lý quyền xem PM Daily Dashboard"
          description="Bạn có thể cho phép tất cả thành viên xem dashboard hoặc chỉ định role cụ thể."
          type="info"
          showIcon
        />

        <div>
          <Space align="center">
            {isVisibleToAll ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            <Text strong>Hiển thị cho tất cả thành viên:</Text>
            <Switch
              checked={isVisibleToAll}
              onChange={setIsVisibleToAll}
              checkedChildren="Có"
              unCheckedChildren="Không"
            />
          </Space>
        </div>

        {!isVisibleToAll && (
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Chọn role được phép xem:
            </Text>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Chọn role..."
              value={selectedRoles}
              onChange={setSelectedRoles}
            >
              {availableRoles.map(role => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
          </div>
        )}

        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={handleSave}
            loading={loading}
            disabled={!isVisibleToAll && selectedRoles.length === 0}
          >
            Lưu cài đặt
          </Button>
        </div>

        <Alert
          message="Lưu ý"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>Nếu chọn &quot;Hiển thị cho tất cả&quot;, dashboard sẽ xuất hiện cho mọi thành viên dự án</li>
              <li>Nếu chọn role cụ thể, chỉ những người có role đó mới thấy dashboard</li>
              <li>PM luôn có quyền xem và quản lý cài đặt này</li>
            </ul>
          }
          type="warning"
          showIcon
        />
      </Space>
    </Card>
  );
};

export default PMDashboardVisibilityControl;
