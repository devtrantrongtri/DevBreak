'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PublicLayout, Container } from '@/components/layout';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onFinish = async (values: LoginForm) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      router.push('/dashboard');
    } catch {
      // Error is already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      form.setFieldsValue({
        email: 'admin@example.com',
        password: 'admin123',
      });
    } else {
      form.setFieldsValue({
        email: 'user@example.com',
        password: 'user123',
      });
    }
  };

  return (
    <PublicLayout>
      <Container>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '80vh',
          padding: '24px'
        }}>
          <Card 
            style={{ 
              width: '100%', 
              maxWidth: 400,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                <LoginOutlined style={{ marginRight: 8 }} />
                Welcome Back
              </Title>
              <Text type="secondary">
                Sign in to your account to continue
              </Text>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Enter your email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider>Demo Accounts</Divider>
            
            <Alert
              message="Demo Credentials"
              description={
                <div>
                  <p>Use these demo accounts to test the application:</p>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      size="small" 
                      onClick={() => fillDemoCredentials('admin')}
                      block
                    >
                      Admin Account (Full Access)
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => fillDemoCredentials('user')}
                      block
                    >
                      User Account (Limited Access)
                    </Button>
                  </Space>
                </div>
              }
              type="info"
              showIcon
            />
          </Card>
        </div>
      </Container>
    </PublicLayout>
  );
}
