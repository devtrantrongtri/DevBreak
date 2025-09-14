'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Space,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Tag,
  Spin,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { UpdateUserDto, UserResponse, GroupResponse } from '@/types/api';

const { Title, Text } = Typography;
const { Password } = Input;

const EditUserPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    if (userId) {
      fetchUserAndGroups();
    }
  }, [userId]);

  const fetchUserAndGroups = async () => {
    try {
      setPageLoading(true);
      const [usersResponse, groupsResponse] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getGroups()
      ]);
      
      const userDetail = usersResponse.find(u => u.id === userId);
      if (userDetail) {
        setUser(userDetail);
        setGroups(groupsResponse);
        setSelectedGroups(userDetail.groups?.map(g => g.id) || []);
        
        // Set form values
        form.setFieldsValue({
          email: userDetail.email,
          displayName: userDetail.displayName,
          isActive: userDetail.isActive,
        });
      } else {
        message.error('User not found');
        router.push('/dashboard/users');
      }
    } catch (error) {
      message.error('Failed to fetch user details');
      console.error('Error fetching user details:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (values: UpdateUserDto) => {
    try {
      setLoading(true);
      
      // Update user basic info
      await apiClient.updateUser(userId, values);
      
      // Update group assignments
      await apiClient.assignUserGroups(userId, selectedGroups);
      
      message.success('User updated successfully');
      router.push(`/dashboard/users/${userId}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update user';
      message.error(errorMessage);
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Email is required'));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error('Please enter a valid email address'));
    }
    return Promise.resolve();
  };

  const validatePassword = (_: any, value: string) => {
    if (value && value.length < 6) {
      return Promise.reject(new Error('Password must be at least 6 characters long'));
    }
    return Promise.resolve();
  };

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>User not found</Text>
      </div>
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/dashboard/users/${userId}`)}
            >
              Back to User Details
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <UserOutlined /> Edit User
            </Title>
          </Space>
        </Col>
      </Row>

      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Title level={4}>
                <UserOutlined /> Basic Information
              </Title>
              
              <Form.Item
                name="email"
                label="Email Address"
                rules={[{ validator: validateEmail }]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter email address"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="displayName"
                label="Display Name"
                rules={[
                  { required: true, message: 'Display name is required' },
                  { min: 2, message: 'Display name must be at least 2 characters' },
                  { max: 50, message: 'Display name cannot exceed 50 characters' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter display name"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ validator: validatePassword }]}
                extra="Leave empty to keep current password"
              >
                <Password
                  prefix={<LockOutlined />}
                  placeholder="Enter new password (optional)"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="isActive"
                label="Account Status"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>

              <Divider />

              <Title level={4}>
                <TeamOutlined /> Group Assignment
              </Title>
              
              <div style={{ marginBottom: 16 }}>
                <Text>Select groups for this user:</Text>
              </div>
              
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select groups"
                value={selectedGroups}
                onChange={setSelectedGroups}
                optionLabelProp="label"
                size="large"
              >
                {groups.map(group => (
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

              {selectedGroups.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Text strong>Selected Groups:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Space wrap>
                      {selectedGroups.map(groupId => {
                        const group = groups.find(g => g.id === groupId);
                        return group ? (
                          <Tag key={groupId} color="blue">
                            {group.name}
                          </Tag>
                        ) : null;
                      })}
                    </Space>
                  </div>
                </div>
              )}

              <Divider />

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    Update User
                  </Button>
                  <Button
                    onClick={() => router.push(`/dashboard/users/${userId}`)}
                    size="large"
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EditUserPage;
