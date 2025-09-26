'use client';

import React, { useState, useEffect } from 'react';
import { Card, Input, App } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { GroupResponse } from '@/types/api';
import GroupPageHeader from '@/components/groups/GroupPageHeader';
import GroupBulkActions from '@/components/groups/GroupBulkActions';
import GroupTable from '@/components/groups/GroupTable';

const { Search } = Input;

const GroupsPage: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { permissions } = useAuth();

  const canCreateGroup = permissions.includes('group.create');
  const canUpdateGroup = permissions.includes('group.update');
  const canDeleteGroup = permissions.includes('group.delete');
  const canAssignPermissions = permissions.includes('group.assignPermissions');

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getGroups();
      setGroups(response);
    } catch (error) {
      message.error('Không thể tải danh sách nhóm');
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = async (groupId: string) => {
    try {
      await apiClient.deleteGroup(groupId);
      message.success('Xóa nhóm thành công');
      fetchGroups();
    } catch (error) {
      message.error('Không thể xóa nhóm');
      console.error('Error deleting group:', error);
    }
  };

  const handleBulkDelete = async (groupIds: string[]) => {
    try {
      await Promise.all(
        groupIds.map(groupId => apiClient.deleteGroup(groupId))
      );
      message.success(`Đã xóa ${groupIds.length} nhóm thành công`);
      setSelectedRowKeys([]);
      fetchGroups();
    } catch (error) {
      message.error('Không thể xóa một số nhóm');
      console.error('Error bulk deleting groups:', error);
    }
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchText.toLowerCase()) ||
    group.code.toLowerCase().includes(searchText.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return (
    <div>
      <GroupPageHeader
        loading={loading}
        exportLoading={false}
        canCreateGroup={canCreateGroup}
        onRefresh={fetchGroups}
        onExport={() => {}}
        onCreate={() => router.push('/dashboard/groups/create')}
      />

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Tìm kiếm nhóm theo tên, mã hoặc mô tả"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400, flex: 1 }}
          />
          <GroupBulkActions
            selectedKeys={selectedRowKeys}
            canDelete={canDeleteGroup}
            onBulkDelete={handleBulkDelete}
            totalCount={filteredGroups.length}
          />
        </div>

        <GroupTable
          groups={filteredGroups}
          loading={loading}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={handleSelectChange}
          canUpdateGroup={canUpdateGroup}
          canDeleteGroup={canDeleteGroup}
          canAssignPermissions={canAssignPermissions}
          onViewDetails={(groupId) => router.push(`/dashboard/groups/${groupId}`)}
          onEditGroup={(groupId) => router.push(`/dashboard/groups/${groupId}/edit`)}
          onManagePermissions={(groupId) => router.push(`/dashboard/groups/${groupId}/permissions`)}
          onDeleteGroup={handleDelete}
        />
      </Card>
    </div>
  );
};

export default GroupsPage;
