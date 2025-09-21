'use client';

import { Table, Tag, Typography, Space, Avatar, Tooltip } from 'antd';
import { 
  UserOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { ActivityLog } from '@/types/dashboard';

const { Text } = Typography;

interface ActivityLogTableProps {
  data: ActivityLog[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  data,
  loading,
  pagination,
}) => {
  const getActionIcon = (action: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'view': <EyeOutlined style={{ color: '#1890ff' }} />,
      'create': <PlusOutlined style={{ color: '#52c41a' }} />,
      'update': <EditOutlined style={{ color: '#faad14' }} />,
      'delete': <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      'login': <LoginOutlined style={{ color: '#52c41a' }} />,
      'logout': <LogoutOutlined style={{ color: '#ff4d4f' }} />,
    };
    return iconMap[action] || <UserOutlined />;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'success': 'green',
      'error': 'red',
      'warning': 'orange',
      'info': 'blue',
    };
    return colorMap[status] || 'default';
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString()}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleTimeString()}
          </Text>
        </div>
      ),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div>{user?.displayName || 'System'}</div>
            {user?.email && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {user.email}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: string, record: ActivityLog) => (
        <Space>
          {getActionIcon(action)}
          <span style={{ textTransform: 'capitalize' }}>{action}</span>
        </Space>
      ),
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      width: 150,
      render: (resource: string, record: ActivityLog) => (
        <div>
          <Text strong style={{ textTransform: 'capitalize' }}>{resource}</Text>
          {record.resourceId && (
            <div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                ID: {record.resourceId.slice(0, 8)}...
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ textTransform: 'capitalize' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
      render: (ip: string) => (
        <Text code style={{ fontSize: '12px' }}>{ip}</Text>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details: Record<string, any>) => {
        if (!details || Object.keys(details).length === 0) return '-';
        
        const detailText = Object.entries(details)
          .filter(([key, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        
        return (
          <Tooltip title={detailText} placement="topLeft">
            <Text 
              ellipsis 
              style={{ 
                maxWidth: 200, 
                fontSize: '12px',
                cursor: 'help'
              }}
            >
              {detailText}
            </Text>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} activities`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
       scroll={{ x: 1200, y: '  70vh' }} 
      size="small"
    />
  );
};

export default ActivityLogTable;
