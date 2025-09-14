import React from 'react';
import { Space, Button, Badge, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface UserBulkActionsProps {
  totalUsers: number;
  selectedCount: number;
  canUpdateUser: boolean;
  canDeleteUser: boolean;
  onBulkDelete: () => void;
  onBulkStatusChange: (isActive: boolean) => void;
}

const UserBulkActions: React.FC<UserBulkActionsProps> = ({
  totalUsers,
  selectedCount,
  canUpdateUser,
  canDeleteUser,
  onBulkDelete,
  onBulkStatusChange,
}) => {
  return (
    <Space wrap>
      <Badge count={totalUsers} showZero>
        <Text type="secondary" style={{ fontSize: '12px' }}>Tổng người dùng</Text>
      </Badge>
      {selectedCount > 0 && (
        <Space>
          {canDeleteUser && (
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={onBulkDelete}
            >
              Xóa ({selectedCount})
            </Button>
          )}
          {canUpdateUser && (
            <>
              <Button
                size="small"
                onClick={() => onBulkStatusChange(true)}
              >
                Kích hoạt ({selectedCount})
              </Button>
              <Button
                size="small"
                onClick={() => onBulkStatusChange(false)}
              >
                Vô hiệu hóa ({selectedCount})
              </Button>
            </>
          )}
        </Space>
      )}
    </Space>
  );
};

export default UserBulkActions;
