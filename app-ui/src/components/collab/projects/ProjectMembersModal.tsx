'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Select,
  message,
  Space,
  Typography,
  Tag,
  Popconfirm,
  Avatar,
  Input,
  Form,
  Divider
} from 'antd';
import { 
  TeamOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';

const { Text, Title } = Typography;
const { Option } = Select;

interface ProjectMembersModalProps {
  visible: boolean;
  onCancel: () => void;
  projectId: string;
}

interface ProjectMember {
  id: string;
  userId: string;
  role: 'PM' | 'BC' | 'DEV' | 'QC';
  isActive: boolean;
  joinedAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    avatar?: string;
  };
}

interface User {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
}

const ROLES = [
  { value: 'PM', label: 'Project Manager', color: 'red' },
  { value: 'BC', label: 'Business Consultant', color: 'blue' },
  { value: 'DEV', label: 'Developer', color: 'green' },
  { value: 'QC', label: 'Quality Control', color: 'orange' }
];

const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  visible,
  onCancel,
  projectId
}) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('DEV');
  const { currentProject, userRole } = useProject();

  const canManageMembers = userRole === 'PM';

  useEffect(() => {
    if (visible && projectId) {
      loadMembers();
    }
  }, [visible, projectId]);

  // Load users after members are loaded
  useEffect(() => {
    if (members.length >= 0) { // >= 0 to handle empty members array
      loadUsers();
    }
  }, [members]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request<ProjectMember[]>(`/collab/projects/${projectId}/members`);
      setMembers(response);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Load members failed:', error);
      message.error('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiClient.request<User[]>('/users');
      // Filter out users who are already members
      const memberUserIds = members.map(m => m.userId);
      const availableUsers = response.filter(user => !memberUserIds.includes(user.id));
      setUsers(availableUsers);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Load users failed:', error);
      message.error('Không thể tải danh sách users');
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !selectedRole) {
      message.error('Vui lòng chọn user và vai trò');
      return;
    }

    try {
      setAddMemberLoading(true);
      await apiClient.request(`/collab/projects/${projectId}/members`, {
        method: 'POST',
        data: {
          userId: selectedUserId,
          role: selectedRole
        }
      });
      
      message.success('Thêm thành viên thành công');
      setSelectedUserId('');
      setSelectedRole('DEV');
      loadMembers();
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      console.error('Add member failed:', error);
      message.error(error?.message || 'Thêm thành viên thất bại');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiClient.request(`/collab/projects/${projectId}/members/${userId}/role`, {
        method: 'PATCH',
        data: { role: newRole }
      });
      
      message.success('Cập nhật vai trò thành công');
      loadMembers();
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      console.error('Update role failed:', error);
      message.error(error?.message || 'Cập nhật vai trò thất bại');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await apiClient.request(`/collab/projects/${projectId}/members/${userId}`, {
        method: 'DELETE'
      });
      
      message.success('Xóa thành viên thành công');
      loadMembers();
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      console.error('Remove member failed:', error);
      message.error(error?.message || 'Xóa thành viên thất bại');
    }
  };

  const columns = [
    {
      title: 'Thành viên',
      key: 'user',
      render: (record: ProjectMember) => (
        <Space>
          <Avatar 
            src={record.user.avatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.user.displayName}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.user.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      key: 'role',
      render: (record: ProjectMember) => {
        const role = ROLES.find(r => r.value === record.role);
        return canManageMembers ? (
          <Select
            value={record.role}
            size="small"
            style={{ width: 120 }}
            onChange={(value) => handleUpdateRole(record.userId, value)}
          >
            {ROLES.map(role => (
              <Option key={role.value} value={role.value}>
                <Tag color={role.color} style={{ margin: 0 }}>
                  {role.value}
                </Tag>
              </Option>
            ))}
          </Select>
        ) : (
          <Tag color={role?.color}>{record.role}</Tag>
        );
      },
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    ...(canManageMembers ? [{
      title: 'Thao tác',
      key: 'actions',
      render: (record: ProjectMember) => (
        <Popconfirm
          title="Xóa thành viên"
          description="Bạn có chắc muốn xóa thành viên này?"
          onConfirm={() => handleRemoveMember(record.userId)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button 
            type="text" 
            danger 
            size="small"
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    }] : []),
  ];

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          Quản lý thành viên dự án
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      style={{ top: 20 }}
      styles={{
        body: { 
          maxHeight: 'calc(100vh - 200px)', 
          overflowY: 'auto',
          padding: '24px'
        }
      }}
    >
      {canManageMembers && (
        <>
          <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
            <Title level={5} style={{ margin: '0 0 12px 0' }}>
              Thêm thành viên mới
            </Title>
            <Space.Compact style={{ width: '100%' }}>
              <Select
                placeholder="Chọn user..."
                value={selectedUserId}
                onChange={setSelectedUserId}
                style={{ flex: 1 }}
                showSearch
                filterOption={(input, option) => {
                  const children = option?.children;
                  if (typeof children === 'string') {
                    return children.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
              >
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.displayName} ({user.email})
                  </Option>
                ))}
              </Select>
              <Select
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: 120 }}
              >
                {ROLES.map(role => (
                  <Option key={role.value} value={role.value}>
                    <Tag color={role.color} style={{ margin: 0 }}>
                      {role.value}
                    </Tag>
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={addMemberLoading}
                onClick={handleAddMember}
              >
                Thêm
              </Button>
            </Space.Compact>
          </div>
          <Divider />
        </>
      )}

      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
      />

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 <strong>Vai trò:</strong> PM (Quản lý dự án), BC (Tư vấn), DEV (Phát triển), QC (Kiểm thử)
        </Text>
      </div>
    </Modal>
  );
};

export default ProjectMembersModal;
