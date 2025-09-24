'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Select,
  message,
  Breadcrumb,
  Spin,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  users: User[];
}

export default function GroupMembersPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
    fetchAvailableUsers();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      console.log(`[GroupMembers] Fetching group details for ID: ${groupId}`);

      const response = await apiClient.request<Group>(`/groups/${groupId}`);
      console.log(`[GroupMembers] Group details loaded:`, response);

      setGroup(response);
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: unknown }; message?: string };
      console.error('Error fetching group details:', error);
      console.error('Error response:', error?.response?.data);
      message.error(`Failed to load group details: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await apiClient.request<User[]>('/users');
      setAvailableUsers(response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUsers = async () => {
    if (selectedUserIds.length === 0) {
      message.warning('Please select at least one user');
      return;
    }

    try {
      setActionLoading(true);
      await apiClient.request(`/groups/${groupId}/users`, {
        method: 'POST',
        data: {
          addUserIds: selectedUserIds,
          removeUserIds: [], // Empty array for remove
        }
      });
      message.success('Users added successfully');
      setAddModalVisible(false);
      setSelectedUserIds([]);
      fetchGroupDetails();
    } catch (error) {
      console.error('Error adding users:', error);
      message.error('Failed to add users');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    Modal.confirm({
      title: 'Remove User',
      content: 'Are you sure you want to remove this user from the group?',
      onOk: async () => {
        try {
          await apiClient.request(`/groups/${groupId}/users/${userId}`, {
            method: 'DELETE'
          });
          message.success('User removed successfully');
          fetchGroupDetails();
        } catch (error) {
          console.error('Error removing user:', error);
          message.error('Failed to remove user');
        }
      },
    });
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{record.displayName}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveUser(record.id)}
        >
          Remove
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!group) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Group not found</Text>
      </div>
    );
  }

  // Filter available users (exclude current members)
  const currentMemberIds = group.users?.map(u => u.id) || [];
  const usersToAdd = availableUsers.filter(u => !currentMemberIds.includes(u.id));

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/dashboard/groups')}
            style={{ padding: 0 }}
          >
            Groups
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Button
            type="link"
            onClick={() => router.push(`/dashboard/groups/${groupId}`)}
            style={{ padding: 0 }}
          >
            {group.name}
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Members</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Group Members: {group.name}
          </Title>
          <Text type="secondary">
            Manage users in this group ({group.users?.length || 0} members)
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModalVisible(true)}
        >
          Add Members
        </Button>
      </div>

      {/* Members Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={group.users || []}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} members`,
          }}
        />
      </Card>

      {/* Add Members Modal */}
      <Modal
        title="Add Members to Group"
        open={addModalVisible}
        onOk={handleAddUsers}
        onCancel={() => {
          setAddModalVisible(false);
          setSelectedUserIds([]);
        }}
        confirmLoading={actionLoading}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Select users to add to the group:</Text>
        </div>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select users"
          value={selectedUserIds}
          onChange={setSelectedUserIds}
          optionFilterProp="children"
          showSearch
        >
          {usersToAdd.map(user => (
            <Option key={user.id} value={user.id}>
              <Space>
                <UserOutlined />
                {user.displayName} ({user.email})
              </Space>
            </Option>
          ))}
        </Select>
        {usersToAdd.length === 0 && (
          <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
            No available users to add
          </Text>
        )}
      </Modal>
    </div>
  );
}
