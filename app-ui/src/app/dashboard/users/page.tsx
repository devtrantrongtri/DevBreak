'use client';

import React, { useState, useEffect } from 'react';
import { Table, Modal, App, Card, Row, Col } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { UserResponse, GroupResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import UserImportModal from '@/components/users/UserImportModal';
import AdvancedSearch, { SearchFilters } from '@/components/users/AdvancedSearch';
import UserPageHeader from '@/components/users/UserPageHeader';
import UserBulkActions from '@/components/users/UserBulkActions';
import { useUserTableColumns } from '@/components/users/UserTableColumns';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);


const UsersPage: React.FC = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const router = useRouter();
  const { permissions } = useAuth();

  const canCreateUser = permissions.includes('user.create');
  const canUpdateUser = permissions.includes('user.update');
  const canDeleteUser = permissions.includes('user.delete');

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      setUsers(response);
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await apiClient.getGroups();
      setGroups(response);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await apiClient.deleteUser(userId);
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      message.error('Không thể xóa người dùng');
      console.error('Error deleting user:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn người dùng để xóa');
      return;
    }

    Modal.confirm({
      title: 'Xóa người dùng đã chọn',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} người dùng đã chọn?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map(userId => apiClient.deleteUser(userId as string))
          );
          message.success(`Đã xóa ${selectedRowKeys.length} người dùng thành công`);
          setSelectedRowKeys([]);
          fetchUsers();
        } catch (error) {
          message.error('Không thể xóa một số người dùng');
          console.error('Error bulk deleting users:', error);
        }
      },
    });
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await apiClient.updateUser(userId, { isActive: !currentStatus });
      message.success(`${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công`);
      fetchUsers();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái người dùng');
      console.error('Error updating user status:', error);
    }
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn người dùng để cập nhật');
      return;
    }

    try {
      await Promise.all(
        selectedRowKeys.map(id =>
          apiClient.updateUser(id as string, { isActive })
        )
      );
      message.success(`${selectedRowKeys.length} người dùng đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công`);
      setSelectedRowKeys([]);
      fetchUsers();
    } catch (error) {
      message.error('Không thể cập nhật người dùng');
      console.error('Error updating users:', error);
    }
  };

  const handleExportUsers = async () => {
    try {
      setExportLoading(true);
      const exportData = filteredUsers.map(user => ({
        Email: user.email,
        'Display Name': user.displayName,
        Status: user.isActive ? 'Active' : 'Inactive',
        Groups: user.groups?.map(g => g.name).join(', ') || 'None',
        'Created At': new Date(user.createdAt).toLocaleDateString(),
      }));

      const csv = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      message.success('Xuất dữ liệu người dùng thành công');
    } catch (error) {
      message.error('Không thể xuất dữ liệu người dùng');
      console.error('Error exporting users:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Text search
    if (searchFilters.searchText) {
      const searchLower = searchFilters.searchText.toLowerCase();
      const matchesText = user.email.toLowerCase().includes(searchLower) ||
        user.displayName.toLowerCase().includes(searchLower);
      if (!matchesText) return false;
    }

    // Status filter
    if (searchFilters.status && searchFilters.status !== 'all') {
      const matchesStatus = (searchFilters.status === 'active' && user.isActive) ||
        (searchFilters.status === 'inactive' && !user.isActive);
      if (!matchesStatus) return false;
    }

    // Groups filter
    if (searchFilters.groups?.length) {
      const matchesGroup = user.groups?.some(group =>
        searchFilters.groups!.includes(group.id)
      );
      if (!matchesGroup) return false;
    }

    // Date range filters
    if (searchFilters.createdDateRange) {
      const createdDate = dayjs(user.createdAt);
      const [start, end] = searchFilters.createdDateRange;
      if (!(createdDate.isAfter(start.subtract(1, 'day')) && createdDate.isBefore(end.add(1, 'day')))) return false;
    }

    if (searchFilters.dateRange) {
      const updatedDate = dayjs(user.updatedAt);
      const [start, end] = searchFilters.dateRange;
      if (!(updatedDate.isAfter(start.subtract(1, 'day')) && updatedDate.isBefore(end.add(1, 'day')))) return false;
    }

    return true;
  });

  const columns = useUserTableColumns({
    canUpdateUser,
    canDeleteUser,
    onViewProfile: (userId) => router.push(`/dashboard/users/${userId}/profile`),
    onViewDetails: (userId) => router.push(`/dashboard/users/${userId}`),
    onEditUser: (userId) => router.push(`/dashboard/users/${userId}/edit`),
    onDeleteUser: handleDelete,
    onStatusToggle: handleStatusToggle,
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <style jsx>{`
        .custom-users-table :global(.ant-table-thead > tr > th) {
          background-color: #fafafa !important;
          font-weight: 500 !important;
          font-size: 12px !important;
        }
      `}</style>

      <UserPageHeader
        loading={loading}
        exportLoading={exportLoading}
        canCreateUser={canCreateUser}
        onRefresh={fetchUsers}
        onExport={handleExportUsers}
        onImport={() => setImportModalVisible(true)}
        onCreate={() => router.push('/dashboard/users/create')}
      />

      <Card
        style={{
          borderRadius: 6,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          minHeight: 'calc(100vh - 280px)'
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <AdvancedSearch
          groups={groups}
          onSearch={setSearchFilters}
          onClear={() => setSearchFilters({})}
          loading={loading}
        />

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={6}>
            <UserBulkActions
              totalUsers={filteredUsers.length}
              selectedCount={selectedRowKeys.length}
              canUpdateUser={canUpdateUser}
              canDeleteUser={canDeleteUser}
              onBulkDelete={handleBulkDelete}
              onBulkStatusChange={handleBulkStatusChange}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={{
            spinning: loading,
            tip: 'Đang tải danh sách người dùng...',
          }}
          rowSelection={canDeleteUser ? rowSelection : undefined}
          pagination={{
            total: filteredUsers.length,
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong ${total} người dùng`,
            pageSizeOptions: ['10', '15', '25', '50'],
          }}
          scroll={{
            x: 800,
            y: 'calc(100vh - 400px)'
          }}
          size="small"
          sticky
          className="custom-users-table"
        />
      </Card>

      <UserImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onSuccess={() => {
          setImportModalVisible(false);
          fetchUsers();
        }}
      />
    </div>
  );
};

export default UsersPage;
