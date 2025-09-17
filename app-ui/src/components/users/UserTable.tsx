import React from 'react';
import { FixedHeightTable } from '@/components/common';
import { UserResponse } from '@/types/api';
import { useUserTableColumns } from './UserTableColumns';

interface UserTableProps {
  users: UserResponse[];
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedRowKeys: React.Key[]) => void;
  canUpdateUser: boolean;
  canDeleteUser: boolean;
  onViewProfile: (userId: string) => void;
  onViewDetails: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onStatusToggle: (userId: string, currentStatus: boolean) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  selectedRowKeys,
  onSelectChange,
  canUpdateUser,
  canDeleteUser,
  onViewProfile,
  onViewDetails,
  onEditUser,
  onDeleteUser,
  onStatusToggle,
}) => {
  const columns = useUserTableColumns({
    canUpdateUser,
    canDeleteUser,
    onViewProfile,
    onViewDetails,
    onEditUser,
    onDeleteUser,
    onStatusToggle,
  });

  const rowSelection = canDeleteUser ? {
    selectedRowKeys,
    onChange: onSelectChange,
  } : undefined;

  return (
    <FixedHeightTable
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={{
        spinning: loading,
        tip: 'Đang tải danh sách người dùng...',
      }}
      rowSelection={rowSelection}
      pagination={{
        total: users.length,
        pageSize: 15,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} trong ${total} người dùng`,
        pageSizeOptions: ['10', '15', '25', '50'],
      }}
      containerHeight="calc(100vh - 260px)"
      scrollY="calc(100vh - 350px)"
      scrollX={1000}
      className="custom-users-table"
    />
  );
};

export default UserTable;
