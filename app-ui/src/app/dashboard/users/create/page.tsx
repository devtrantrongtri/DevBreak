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
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { CreateUserDto, GroupResponse } from '@/types/api';

const { Title, Text } = Typography;
const { Password } = Input;

const CreateUserPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await apiClient.getGroups();
      setGroups(response);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSubmit = async (values: CreateUserDto) => {
    try {
      setLoading(true);
      
      // Create user first
      const newUser = await apiClient.createUser(values);
      
      // Assign groups if any selected
      if (selectedGroups.length > 0) {
        await apiClient.assignUserGroups(newUser.id, selectedGroups);
      }
      
      message.success('User created successfully');
      router.push('/dashboard/users');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create user';
      message.error(errorMessage);
      console.error('Error creating user:', error);
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
    if (!value) {
      return Promise.reject(new Error('Password is required'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('Password must be at least 6 characters long'));
    }
    return Promise.resolve();
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/dashboard/users')}
            >
              Back to Users
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <UserOutlined /> Create New User
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
              initialValues={{
                isActive: true,
              }}
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
              >
                <Password
                  prefix={<LockOutlined />}
                  placeholder="Enter password"
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
                <Text>Select groups for this user (optional):</Text>
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
                    Create User
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard/users')}
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

export default CreateUserPage;
