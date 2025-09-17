'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Result,
  App,
} from 'antd';
import {
  AddPermissionModal,
  EditPermissionModal,
  DeletePermissionModal,
  PermissionTable,
  PermissionHeader,
  PermissionSearch,
} from '@/components/PermissionManagement';
import { apiClient } from '@/lib/api';
import { PermissionResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';


const PermissionsPage: React.FC = () => {
  const { message } = App.useApp();
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
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

  useEffect(() => {
    fetchPermissions();
  }, []);

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
      {/* Header */}
      <PermissionHeader
        loading={loading}
        onRefresh={fetchPermissions}
        onAdd={() => setAddModalVisible(true)}
      />

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
