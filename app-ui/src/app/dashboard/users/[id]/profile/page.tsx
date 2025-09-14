'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Space,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Avatar,
  Upload,
  Tag,
  List,
  Timeline,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CameraOutlined,
  HistoryOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { UserResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import ActivityLog from '@/components/common/ActivityLog';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { permissions } = useAuth();

  const canUpdateUser = permissions.includes('user.update');

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUser(userId);
      setUser(response);
      form.setFieldsValue({
        email: response.email,
        displayName: response.displayName,
        isActive: response.isActive,
      });
    } catch (error) {
      message.error('Failed to fetch user details');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      await apiClient.updateUser(userId, values);
      message.success('User profile updated successfully');
      fetchUser();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update user profile';
      message.error(errorMessage);
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Card loading />
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
              onClick={() => router.push('/dashboard/users')}
            >
              Back to Users
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <UserOutlined /> User Profile
            </Title>
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="Profile Overview">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={80} icon={<UserOutlined />} />
              <div style={{ marginTop: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {user.displayName}
                </Title>
                <Text type="secondary">{user.email}</Text>
              </div>
              <div style={{ marginTop: 16 }}>
                <Tag color={user.isActive ? 'green' : 'red'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>Groups:</Text>
              <div style={{ marginTop: 8 }}>
                {user.groups && user.groups.length > 0 ? (
                  user.groups.map(group => (
                    <Tag key={group.id} icon={<TeamOutlined />} style={{ margin: '4px' }}>
                      {group.name}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No groups assigned</Text>
                )}
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>Account Details:</Text>
              <div style={{ marginTop: 8 }}>
                <div><Text type="secondary">Created:</Text> {new Date(user.createdAt).toLocaleDateString()}</div>
                <div><Text type="secondary">Updated:</Text> {new Date(user.updatedAt).toLocaleDateString()}</div>
                <div><Text type="secondary">ID:</Text> <Text code>{user.id}</Text></div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="profile">
            <TabPane tab="Profile Settings" key="profile">
              <Card>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                  disabled={!canUpdateUser}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: 'Email is required' },
                          { type: 'email', message: 'Please enter a valid email' },
                        ]}
                      >
                        <Input placeholder="Enter email address" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="displayName"
                        label="Display Name"
                        rules={[
                          { required: true, message: 'Display name is required' },
                          { min: 2, message: 'Display name must be at least 2 characters' },
                        ]}
                      >
                        <Input placeholder="Enter display name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
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
                    </Col>
                  </Row>

                  {canUpdateUser && (
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={saving}
                      >
                        Save Changes
                      </Button>
                    </Form.Item>
                  )}
                </Form>
              </Card>
            </TabPane>

            <TabPane tab="Activity Log" key="activity">
              <Card title={<><HistoryOutlined /> Recent Activity</>}>
                <ActivityLog
                  userId={userId}
                  showUser={false}
                  limit={20}
                  height={400}
                />
              </Card>
            </TabPane>

            <TabPane tab="Permissions" key="permissions">
              <Card title={<><SafetyCertificateOutlined /> Effective Permissions</>}>
                <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                  Permissions inherited from assigned groups:
                </Text>
                <div>
                  {user.groups?.map(group => (
                    <div key={group.id} style={{ marginBottom: 16 }}>
                      <Text strong>{group.name}:</Text>
                      <div style={{ marginTop: 8 }}>
                        {group.permissions?.map(permission => (
                          <Tag key={permission.id} style={{ margin: '2px' }}>
                            {permission.name}
                          </Tag>
                        )) || <Text type="secondary">No permissions</Text>}
                      </div>
                    </div>
                  )) || <Text type="secondary">No groups assigned</Text>}
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfilePage;
