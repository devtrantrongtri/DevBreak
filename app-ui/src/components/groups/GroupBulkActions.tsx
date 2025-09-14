import React from 'react';
import { Space, Button, Badge } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface GroupBulkActionsProps {
  selectedKeys: React.Key[];
  totalCount: number;
  canDelete: boolean;
  onBulkDelete: (groupIds: string[]) => void;
}

const GroupBulkActions: React.FC<GroupBulkActionsProps> = ({
  selectedKeys,
  totalCount,
  canDelete,
  onBulkDelete,
}) => {
  const handleBulkDelete = () => {
    const groupIds = selectedKeys.map(key => key.toString());
    onBulkDelete(groupIds);
  };

  return (
    <Space>
      <Badge count={totalCount} showZero>
        <span>Tổng nhóm</span>
      </Badge>
      {selectedKeys.length > 0 && canDelete && (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleBulkDelete}
        >
          Xóa đã chọn ({selectedKeys.length})
        </Button>
      )}
    </Space>
  );
};

export default GroupBulkActions;
