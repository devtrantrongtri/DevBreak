'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  message,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  List,
  Avatar,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { UserResponse, GroupResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';


const { Title, Text } = Typography;


const UserDetailsPage: React.FC = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [allGroups, setAllGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [assigningGroups, setAssigningGroups] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { permissions } = useAuth();
  const userId = params.id as string;


  const canUpdateUser = permissions.includes('user.update');
  const canManageGroups = permissions.includes('group.assignPermissions');


  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchAllGroups();
    }
  }, [userId]);


  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      const userDetail = response.find(u => u.id === userId);
      if (userDetail) {
        setUser(userDetail);
      } else {
        message.error('Không tìm thấy người dùng');
        router.push('/dashboard/users');
      }
    } catch (error) {
      message.error('Không thể lấy thông tin người dùng');
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchAllGroups = async () => {
    try {
      const response = await apiClient.getGroups();
      setAllGroups(response);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };


  const handleAssignGroups = async () => {
    try {
      setAssigningGroups(true);
      await apiClient.assignUserGroups(userId, selectedGroups);
      message.success('Gán nhóm thành công');
      setGroupModalVisible(false);
      fetchUserDetails();
    } catch (error) {
      message.error('Không thể gán nhóm');
      console.error('Error assigning groups:', error);
    } finally {
      setAssigningGroups(false);
    }
  };


  const handleRemoveFromGroup = async (groupId: string) => {
    try {
      const currentGroupIds = user?.groups?.map(g => g.id) || [];
      const newGroupIds = currentGroupIds.filter(id => id !== groupId);
      await apiClient.assignUserGroups(userId, newGroupIds);
      message.success('Đã xóa người dùng khỏi nhóm');
      fetchUserDetails();
    } catch (error) {
      message.error('Không thể xóa người dùng khỏi nhóm');
      console.error('Error removing user from group:', error);
    }
  };


  const openGroupModal = () => {
    const currentGroupIds = user?.groups?.map(g => g.id) || [];
    setSelectedGroups(currentGroupIds);
    setGroupModalVisible(true);
  };


  const getEffectivePermissions = () => {
    const permissions = new Set<string>();
    user?.groups?.forEach(group => {
      group.permissions?.forEach(permission => {
        permissions.add(permission.code);
      });
    });
    return Array.from(permissions).sort();
  };


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }


  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Không tìm thấy người dùng</Text>
      </div>
    );
  }


  const effectivePermissions = getEffectivePermissions();


  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/dashboard/users')}
            >
              Quay lại Danh sách
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <UserOutlined /> Chi tiết người dùng
            </Title>
          </Space>
        </Col>
        <Col>
          {canUpdateUser && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/dashboard/users/${userId}/edit` )}
            >
              Chỉnh sửa
            </Button>
          )}
        </Col>
      </Row>


      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Thông tin người dùng" extra={<UserOutlined />}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên hiển thị">
                {user.displayName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={user.isActive ? 'green' : 'red'}>
                  {user.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(user.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {new Date(user.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>


        <Col xs={24} lg={12}>
          <Card 
            title="Thành viên nhóm" 
            extra={<TeamOutlined />}
            actions={canManageGroups ? [
              <Button
                key="manage"
                type="link"
                icon={<PlusOutlined />}
                onClick={openGroupModal}
              >
                Quản lý nhóm
              </Button>
            ] : undefined}
          >
            {user.groups && user.groups.length > 0 ? (
              <List
                dataSource={user.groups}
                renderItem={(group) => (
                  <List.Item
                    actions={canManageGroups ? [
                      <Tooltip title="Xóa khỏi nhóm">
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveFromGroup(group.id)}
                        />
                      </Tooltip>
                    ] : undefined}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<TeamOutlined />} />}
                      title={group.name}
                      description={group.description}
                    />
                    <Tag>{group.code}</Tag>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                <TeamOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>Chưa được gán nhóm</div>
              </div>
            )}
          </Card>
        </Col>


        <Col xs={24}>
          <Card title="Quyền hạn hiệu lực" extra={<SafetyCertificateOutlined />}>
            {effectivePermissions.length > 0 ? (
              <Space wrap>
                {effectivePermissions.map(permission => (
                  <Tag key={permission} color="blue">
                    {permission}
                  </Tag>
                ))}
              </Space>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                <SafetyCertificateOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>Không có quyền hạn được gán</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>


      <Modal
        title="Quản lý nhóm người dùng"
        open={groupModalVisible}
        onOk={handleAssignGroups}
        onCancel={() => setGroupModalVisible(false)}
        confirmLoading={assigningGroups}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Chọn nhóm cho người dùng này:</Text>
        </div>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Chọn nhóm"
          value={selectedGroups}
          onChange={setSelectedGroups}
          optionLabelProp="label"
        >
          {allGroups.map(group => (
            <Select.Option
              key={group.id}
              value={group.id}
              label={group.name}
            >
              <Space>
                <TeamOutlined />
                <span>{group.name}</span>
                <Tag size="small">{group.code}</Tag>
              </Space>
            </Select.Option>
          ))}
        </Select>
        <Divider />
        <div>
          <Text strong>Nhóm đã chọn:</Text>
          <div style={{ marginTop: 8 }}>
            {selectedGroups.length > 0 ? (
              <Space wrap>
                {selectedGroups.map(groupId => {
                  const group = allGroups.find(g => g.id === groupId);
                  return group ? (
                    <Tag key={groupId} color="blue">
                      {group.name}
                    </Tag>
                  ) : null;
                })}
              </Space>
            ) : (
              <Text type="secondary">Chưa chọn nhóm nào</Text>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};


export default UserDetailsPage;