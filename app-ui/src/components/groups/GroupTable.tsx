import React from 'react';
import { FixedHeightTable } from '@/components/common';
import { GroupResponse } from '@/types/api';
import { useGroupTableColumns } from './GroupTableColumns';

interface GroupTableProps {
  groups: GroupResponse[];
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedRowKeys: React.Key[]) => void;
  canUpdateGroup: boolean;
  canDeleteGroup: boolean;
  canAssignPermissions: boolean;
  onViewDetails: (groupId: string) => void;
  onEditGroup: (groupId: string) => void;
  onManagePermissions: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

const GroupTable: React.FC<GroupTableProps> = ({
  groups,
  loading,
  selectedRowKeys,
  onSelectChange,
  canUpdateGroup,
  canDeleteGroup,
  canAssignPermissions,
  onViewDetails,
  onEditGroup,
  onManagePermissions,
  onDeleteGroup,
}) => {
  const columns = useGroupTableColumns({
    canUpdateGroup,
    canDeleteGroup,
    canAssignPermissions,
    onViewDetails,
    onEditGroup,
    onManagePermissions,
    onDeleteGroup,
  });

  const rowSelection = canDeleteGroup ? {
    selectedRowKeys,
    onChange: onSelectChange,
  } : undefined;

  return (
    <FixedHeightTable
      columns={columns}
      dataSource={groups}
      rowKey="id"
      loading={{
        spinning: loading,
        tip: 'Đang tải nhóm...',
      }}
      rowSelection={rowSelection}
      pagination={{
        total: groups.length,
        pageSize: 15,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} của ${total} nhóm`,
        pageSizeOptions: ['10', '15', '25', '50'],
      }}
      containerHeight="calc(100vh - 220px)"
      scrollY="calc(100vh - 300px)"
      scrollX={900}
      size="middle"
    />
  );
};

export default GroupTable;
