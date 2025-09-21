'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Result,
  App,
  Switch,
  Space,
  Typography,
  Button,
} from 'antd';
import {
  AddPermissionModal,
  EditPermissionModal,
  DeletePermissionModal,
  PermissionTable,
  PermissionSearch,
  PermissionTreeView,
  PermissionSyncStatus,
} from '@/components/PermissionManagement';
import { apiClient } from '@/lib/api';
import { PermissionResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

const { Text } = Typography;

interface PermissionModule {
  name: string;
  displayName: string;
  permissions: PermissionResponse[];
}

interface SyncResult {
  created: string[];
  updated: string[];
  discovered: number;
  existing: number;
}

interface DiscoveredPermission {
  code: string;
  name: string;
  description: string;
  source: string;
  module: string;
}

const PermissionsPage: React.FC = () => {
  const { message } = App.useApp();
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');
  const [lastSyncTime, setLastSyncTime] = useState<Date | undefined>();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionResponse | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { permissions: userPermissions } = useAuth();

  const canManagePermissions = userPermissions.includes('system.manage') || 
                               userPermissions.includes('system.menus.manage');

  // Filtered permissions based on search
  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission =>
      permission.code.toLowerCase().includes(searchText.toLowerCase()) ||
      permission.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (permission.description || '').toLowerCase().includes(searchText.toLowerCase())
    );
  }, [permissions, searchText]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPermissions();
      setPermissions(response);
      message.success('Tải danh sách quyền thành công');
    } catch (error) {
      message.error('Không thể tải danh sách quyền');
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await apiClient.get('/permissions/modules');
      setModules(response.data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleSync = async (): Promise<SyncResult> => {
    try {
      const response = await apiClient.post('/permissions/sync');
      setLastSyncTime(new Date());
      await fetchPermissions();
      await fetchModules();
      return response.data;
    } catch (error) {
      console.error('Sync failed:', error);
      throw new Error('Sync failed');
    }
  };

  const handleDiscover = async (): Promise<DiscoveredPermission[]> => {
    try {
      const response = await apiClient.get('/permissions/discover');
      return response.data.permissions || [];
    } catch (error) {
      console.error('Discovery failed:', error);
      throw new Error('Discovery failed');
    }
  };

  const handleUpdatePermissionName = async (permissionId: string, newName: string) => {
    try {
      setUpdateLoading(true);
      // Find the current permission to preserve other fields
      const currentPermission = permissions.find(p => p.id === permissionId);
      if (!currentPermission) {
        throw new Error('Permission not found');
      }

      await apiClient.updatePermission(permissionId, {
        name: newName,
        description: currentPermission.description,
        parentCode: currentPermission.parentCode,
        isActive: currentPermission.isActive
      });
      await fetchPermissions();
      message.success('Cập nhật tên quyền thành công');
    } catch (error) {
      message.error('Cập nhật tên quyền thất bại');
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchModules();
  }, []);

  const handleRefresh = async () => {
    await fetchPermissions();
    await fetchModules();
  };

  const handleEdit = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setEditModalVisible(true);
  };

  const handleDelete = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setDeleteModalVisible(true);
  };



  if (!canManagePermissions) {
    return (
      <Card>
        <Result
          status="403"
          title="Không có quyền truy cập"
          subTitle="Bạn không có quyền xem trang quản lý quyền"
        />
      </Card>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      {/* Sync Status */}
      <PermissionSyncStatus
        onSync={handleSync}
        onDiscover={handleDiscover}
        lastSyncTime={lastSyncTime}
      />

      {/* View Mode Toggle */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text type="secondary" style={{ marginRight: 8 }}>Chế độ xem:</Text>
          <Switch
            checkedChildren="Tree"
            unCheckedChildren="Table"
            checked={viewMode === 'tree'}
            onChange={(checked) => setViewMode(checked ? 'tree' : 'table')}
          />
        </div>
        <Space>
          <Button
            size="small"
            onClick={fetchPermissions}
            loading={loading}
            style={{ borderRadius: 4 }}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => setAddModalVisible(true)}
            style={{ borderRadius: 4 }}
          >
            Thêm quyền
          </Button>
        </Space>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'tree' ? (
        <PermissionTreeView
          permissions={permissions}
          modules={modules}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => setAddModalVisible(true)}
          onSync={handleSync}
          onRefresh={fetchPermissions}
        />
      ) : (
        <>
          {/* Controls */}
          <PermissionSearch
            searchText={searchText}
            onSearch={(value) => setSearchText(value)}
            totalCount={filteredPermissions.length}
          />

          {/* Table */}
          <Card
            size="small"
            style={{
              marginTop: 0,
              borderRadius: 6,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
            }}
          >
            <PermissionTable
              permissions={filteredPermissions}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </>
      )}

      {/* Modals */}
      <AddPermissionModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={fetchPermissions}
        permissions={permissions}
      />

      <EditPermissionModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={fetchPermissions}
        permissions={permissions}
        selectedPermission={selectedPermission}
        loading={updateLoading}
      />

      <DeletePermissionModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onSuccess={fetchPermissions}
        selectedPermission={selectedPermission}
        loading={updateLoading}
      />
    </div>
  );
};

export default PermissionsPage;
