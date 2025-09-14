'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Input, App } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { GroupResponse } from '@/types/api';
import GroupPageHeader from '@/components/groups/GroupPageHeader';
import GroupBulkActions from '@/components/groups/GroupBulkActions';
import { useGroupTableColumns } from '@/components/groups/GroupTableColumns';

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

  useEffect(() => {
    fetchGroups();
  }, []);

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

  const columns = useGroupTableColumns({
    canUpdateGroup,
    canDeleteGroup,
    canAssignPermissions,
    onViewDetails: (groupId: string) => router.push(`/dashboard/groups/${groupId}`),
    onEditGroup: (groupId: string) => router.push(`/dashboard/groups/${groupId}/edit`),
    onManagePermissions: (groupId: string) => router.push(`/dashboard/groups/${groupId}/permissions`),
    onDeleteGroup: handleDelete,
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
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

        <Table
          columns={columns}
          dataSource={filteredGroups}
          rowKey="id"
          loading={{
            spinning: loading,
            tip: 'Đang tải nhóm...',
          }}
          rowSelection={canDeleteGroup ? rowSelection : undefined}
          pagination={{
            total: filteredGroups.length,
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhóm`,
            pageSizeOptions: ['10', '15', '25', '50'],
          }}
          scroll={{
            x: 800,
            y: 'calc(100vh - 400px)' // Fixed height with scroll
          }}
          size="middle"
          sticky
        />
      </Card>
    </div>
  );
};

export default GroupsPage;
