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
      message.error('Không thể lấy thông tin người dùng');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      await apiClient.updateUser(userId, values);
      message.success('Cập nhật hồ sơ người dùng thành công');
      fetchUser();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Không thể cập nhật hồ sơ người dùng';
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
        <Text>Không tìm thấy người dùng</Text>
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
              Quay lại Danh sách
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <UserOutlined /> Hồ sơ người dùng
            </Title>
          </Space>
        </Col>
      </Row>


      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="Tổng quan hồ sơ">
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
                  {user.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </Tag>
              </div>
            </div>


            <Divider />


            <div>
              <Text strong>Nhóm:</Text>
              <div style={{ marginTop: 8 }}>
                {user.groups && user.groups.length > 0 ? (
                  user.groups.map(group => (
                    <Tag key={group.id} icon={<TeamOutlined />} style={{ margin: '4px' }}>
                      {group.name}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">Chưa được gán nhóm</Text>
                )}
              </div>
            </div>


            <Divider />


            <div>
              <Text strong>Thông tin tài khoản:</Text>
              <div style={{ marginTop: 8 }}>
                <div><Text type="secondary">Ngày tạo:</Text> {new Date(user.createdAt).toLocaleDateString()}</div>
                <div><Text type="secondary">Cập nhật:</Text> {new Date(user.updatedAt).toLocaleDateString()}</div>
                <div><Text type="secondary">ID:</Text> <Text code>{user.id}</Text></div>
              </div>
            </div>
          </Card>
        </Col>


        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="profile">
            <TabPane tab="Cài đặt hồ sơ" key="profile">
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
                        label="Địa chỉ Email"
                        rules={[
                          { required: true, message: 'Email là bắt buộc' },
                          { type: 'email', message: 'Vui lòng nhập email hợp lệ' },
                        ]}
                      >
                        <Input placeholder="Nhập địa chỉ email" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="displayName"
                        label="Tên hiển thị"
                        rules={[
                          { required: true, message: 'Tên hiển thị là bắt buộc' },
                          { min: 2, message: 'Tên hiển thị phải có ít nhất 2 ký tự' },
                        ]}
                      >
                        <Input placeholder="Nhập tên hiển thị" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        name="isActive"
                        label="Trạng thái tài khoản"
                        valuePropName="checked"
                      >
                        <Switch
                          checkedChildren="Hoạt động"
                          unCheckedChildren="Không hoạt động"
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
                        Lưu thay đổi
                      </Button>
                    </Form.Item>
                  )}
                </Form>
              </Card>
            </TabPane>


            <TabPane tab="Nhật ký hoạt động" key="activity">
              <Card title={<><HistoryOutlined /> Hoạt động gần đây</>}>
                <ActivityLog
                  userId={userId}
                  showUser={false}
                  limit={20}
                  height={400}
                />
              </Card>
            </TabPane>


            <TabPane tab="Quyền hạn" key="permissions">
              <Card title={<><SafetyCertificateOutlined /> Quyền hạn hiệu lực</>}>
                <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                  Quyền hạn được kế thừa từ các nhóm đã gán:
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
                        )) || <Text type="secondary">Không có quyền hạn</Text>}
                      </div>
                    </div>
                  )) || <Text type="secondary">Chưa được gán nhóm</Text>}
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