'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  Tag,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  TeamOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { UserResponse } from '@/types/api';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userDetails, setUserDetails] = useState<UserResponse | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const { user, refreshUserData } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          setFetchingDetails(true);
          const details = await apiClient.getUser(user.id);
          setUserDetails(details);
          form.setFieldsValue({
            email: details.email,
            displayName: details.displayName,
          });
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          message.error('Không thể tải thông tin chi tiết');
          // Fallback to basic user info
          form.setFieldsValue({
            email: user.email,
            displayName: user.displayName,
          });
        } finally {
          setFetchingDetails(false);
        }
      }
    };

    fetchUserDetails();
  }, [user, form]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      await apiClient.updateUser(user!.id, values);
      message.success('Cập nhật thông tin thành công');
      await refreshUserData();
      setEditing(false);
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || 'Không thể cập nhật thông tin';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  if (!user || fetchingDetails) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Đang tải thông tin người dùng...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0, fontWeight: 500 }}>
            <UserOutlined style={{ marginRight: 8 }} /> Hồ sơ cá nhân
          </Title>
        </Col>
        <Col>
          <Space size="small">
            <Button
              size="small"
              icon={<SafetyCertificateOutlined />}
              onClick={() => setChangePasswordVisible(true)}
              style={{ 
                borderRadius: 4,
                boxShadow: 'none',
                border: '1px solid #d9d9d9'
              }}
            >
              Đổi mật khẩu
            </Button>
            <Button
              size="small"
              type={editing ? 'default' : 'primary'}
              icon={editing ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => editing ? form.submit() : setEditing(true)}
              loading={loading}
              style={{ 
                borderRadius: 4,
                boxShadow: 'none'
              }}
            >
              {editing ? 'Lưu' : 'Sửa'}
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card 
            style={{ 
              borderRadius: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={80} 
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: '#f0f0f0',
                  color: '#666',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <div style={{ marginTop: 12 }}>
                <Upload
                  showUploadList={false}
                  beforeUpload={() => false}
                >
                  <Button 
                    icon={<CameraOutlined />} 
                    size="small"
                    type="text"
                    style={{ 
                      fontSize: '12px',
                      color: '#666',
                      padding: '2px 8px'
                    }}
                  >
                    Đổi ảnh
                  </Button>
                </Upload>
              </div>
            </div>

            <div style={{ fontSize: '13px' }}>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>TÊN HIỂN THỊ</Text>
                <br />
                <Text strong style={{ fontSize: '14px' }}>{user.displayName}</Text>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>EMAIL</Text>
                <br />
                <Text style={{ fontSize: '13px' }}>
                  <MailOutlined style={{ marginRight: 4, color: '#666' }} />
                  {user.email}
                </Text>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>TRẠNG THÁI</Text>
                <br />
                <Tag 
                  color={user.isActive ? 'green' : 'red'}
                  style={{ 
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: 3,
                    marginTop: 2
                  }}
                >
                  {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>NGÀY TẠO</Text>
                <br />
                <Text style={{ fontSize: '13px' }}>
                  <CalendarOutlined style={{ marginRight: 4, color: '#666' }} />
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </div>
              
              <div>
                <Text type="secondary" style={{ fontSize: '11px' }}>CẬP NHẬT CUỐI</Text>
                <br />
                <Text style={{ fontSize: '13px' }}>
                  {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                </Text>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div>
              <Text type="secondary" style={{ fontSize: '11px' }}>NHÓM QUYỀN</Text>
              <div style={{ marginTop: 8 }}>
                {userDetails?.groups && userDetails.groups.length > 0 ? (
                  userDetails.groups.map(group => (
                    <Tag 
                      key={group.id} 
                      icon={<TeamOutlined />} 
                      style={{ 
                        margin: '2px 4px 2px 0',
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: 3,
                        backgroundColor: '#f6ffed',
                        borderColor: '#b7eb8f',
                        color: '#389e0d'
                      }}
                    >
                      {group.name}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary" style={{ fontSize: '12px' }}>Chưa có nhóm nào</Text>
                )}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Tabs 
            defaultActiveKey="info"
            size="small"
            className="profile-tabs"
            style={{
              fontSize: '13px',
              padding: '8px 16px'
            }}
            items={[
              {
                key: 'info',
                label: 'Thông tin cá nhân',
                children: (
              <Card
                style={{ 
                  borderRadius: 6,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #f0f0f0'
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                  disabled={!editing}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label="Địa chỉ email"
                        rules={[
                          { required: true, message: 'Email là bắt buộc' },
                          { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                      >
                        <Input 
                          prefix={<MailOutlined />}
                          placeholder="Nhập địa chỉ email" 
                        />
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
                        <Input 
                          prefix={<UserOutlined />}
                          placeholder="Nhập tên hiển thị" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                      >
                        <Input 
                          prefix={<PhoneOutlined />}
                          placeholder="Nhập số điện thoại" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="department"
                        label="Phòng ban"
                      >
                        <Input placeholder="Nhập phòng ban" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {editing && (
                    <div style={{ textAlign: 'right', marginTop: 16 }}>
                      <Space size="small">
                        <Button 
                          size="small"
                          onClick={() => setEditing(false)}
                          style={{ 
                            borderRadius: 4,
                            boxShadow: 'none'
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          loading={loading}
                          style={{ 
                            borderRadius: 4,
                            boxShadow: 'none'
                          }}
                        >
                          Lưu
                        </Button>
                      </Space>
                    </div>
                  )}
                </Form>
              </Card>
                )
              }
            ]}
          />
        </Col>
      </Row>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={changePasswordVisible}
        onCancel={() => setChangePasswordVisible(false)}
        userId={user.id}
      />
    </div>
  );
};

export default ProfilePage;
