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

/**
 * Compact layout phiên bản CreateUser:
 * - Căn giữa màn hình, Card có maxWidth (720px) & maxHeight (80vh)
 * - Nội dung form scroll bên trong Card
 * - Footer (Create / Cancel) sticky ở cuối form
 * - Giảm kích cỡ control (size="middle"), giảm padding & spacing
 */
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
      const newUser = await apiClient.createUser(values);
      if (selectedGroups.length > 0) {
        await apiClient.assignUserGroups(newUser.id, selectedGroups);
      }
      message.success('Tạo người dùng thành công');
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
    if (!value) return Promise.reject(new Error('Địa chỉ email là bắt buộc'));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return Promise.reject(new Error('Vui lòng nhập địa chỉ email hợp lệ'));
    return Promise.resolve();
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) return Promise.reject(new Error('Mật khẩu là bắt buộc'));
    if (value.length < 6) return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự'));
    return Promise.resolve();
  };

  return (
    <div style={{ padding: '0px 24px' }}>
      {/* Header - Nút Back và tiêu đề ở ngoài form */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/dashboard/users')}
        >
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          <UserOutlined /> Tạo người dùng mới
        </Title>
      </div>
      
      {/* Form nhỏ gọn */}
      <Card
        style={{ maxWidth: 600, margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        bodyStyle={{
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh', // Giới hạn chiều cao để có thể cuộn khi nội dung dài
        }}
      >
        {/* Nội dung scroll */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ isActive: true }}
          >
            <Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
              <UserOutlined /> Thông tin cơ bản
            </Title>

            <Form.Item name="email" label="Địa chỉ email" rules={[{ validator: validateEmail }]} required style={{ marginBottom: 12 }}>
              <Input prefix={<MailOutlined />} placeholder="Nhập địa chỉ email" size="middle" />
            </Form.Item>

            <Form.Item
              name="displayName"
              label="Tên hiển thị"
              rules={[
                { required: true, message: 'Tên hiển thị là bắt buộc' },
                { min: 2, message: 'Tên hiển thị phải có ít nhất 2 ký tự' },
                { max: 50, message: 'Tên hiển thị không được vượt quá 50 ký tự' },
              ]}
              required
              style={{ marginBottom: 12 }}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tên hiển thị" size="middle" />
            </Form.Item>

            <Form.Item name="password" label="Mật khẩu" rules={[{ validator: validatePassword }]} required style={{ marginBottom: 12 }}>
              <Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="middle" />
            </Form.Item>

            <Form.Item name="isActive" label="Trạng thái tài khoản" valuePropName="checked" style={{ marginBottom: 12 }}>
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" size="small" />
            </Form.Item>

            <Divider style={{ margin: '8px 0' }} />

            <Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
              <TeamOutlined /> Phân nhóm người dùng
            </Title>

            <div style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 13 }}>Chọn nhóm cho người dùng này (tùy chọn):</Text>
            </div>

            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Chọn nhóm người dùng"
              value={selectedGroups}
              onChange={setSelectedGroups}
              optionLabelProp="label"
              size="middle"
              maxTagCount={3}
              showSearch
              filterOption={(input, option) => {
                const searchText = input.toLowerCase();
                const label = option?.label?.toString().toLowerCase() || '';
                const group = groups.find(g => g.id === option?.value);
                const groupCode = group?.code?.toLowerCase() || '';
                
                return label.includes(searchText) || groupCode.includes(searchText);
              }}
              listHeight={250}
              dropdownRender={(menu) => (
                <>
                  <div style={{ padding: '4px 8px', color: '#1890ff', borderBottom: '1px solid #f0f0f0' }}>
                    <TeamOutlined /> Tìm kiếm theo tên hoặc mã nhóm
                  </div>
                  {menu}
                </>
              )}
            >
              {groups.map((group) => (
                <Select.Option key={group.id} value={group.id} label={group.name}>
                  <Space size={6}>
                    <TeamOutlined />
                    <span>{group.name}</span>
                    <Tag>{group.code}</Tag>
                  </Space>
                </Select.Option>
              ))}
            </Select>

            {selectedGroups.length > 0 && (
              <div style={{ marginTop: 8, border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px', maxHeight: '120px', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>Nhóm đã chọn ({selectedGroups.length}):</Text>
                  {selectedGroups.length > 1 && (
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setSelectedGroups([])} 
                      style={{ fontSize: 12, padding: 0, height: 'auto' }}
                    >
                      Xóa tất cả
                    </Button>
                  )}
                </div>
                <div>
                  {selectedGroups.map((groupId) => {
                    const group = groups.find((g) => g.id === groupId);
                    return group ? (
                      <Tag 
                        key={groupId} 
                        color="blue" 
                        style={{ margin: '2px 4px 2px 0' }}
                        closable
                        onClose={() => setSelectedGroups(prev => prev.filter(id => id !== groupId))}
                      >
                        <Space size={4}>
                          <TeamOutlined />
                          {group.name}
                          <span style={{ opacity: 0.7, fontSize: '11px' }}>({group.code})</span>
                        </Space>
                      </Tag>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </Form>
        </div>

        {/* Footer sticky */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            width: '100%',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Space size={8}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="middle"
              onClick={() => form.submit()}
            >
              Tạo người dùng
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/users')} 
              size="middle"
            >
              Hủy bỏ
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CreateUserPage;
