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

  const fillDemoCredentials = (username: string, password: string) => {
    form.setFieldsValue({
      email: username,
      password: password,
    });
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
                  // { type: 'email', message: 'Please enter a valid email!' }
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
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Button
                      size="small"
                      onClick={() => fillDemoCredentials('admin', 'admin123')}
                      block
                      type="primary"
                    >
                      👑 Admin - Full Access
                    </Button>
                    <Button
                      size="small"
                      onClick={() => fillDemoCredentials('pm_john', 'pm123')}
                      block
                    >
                      📊 PM John - Project Manager
                    </Button>
                    <Button
                      size="small"
                      onClick={() => fillDemoCredentials('dev_alice', 'dev123')}
                      block
                    >
                      💻 Alice - Developer
                    </Button>
                    <Button
                      size="small"
                      onClick={() => fillDemoCredentials('qc_bob', 'qc123')}
                      block
                    >
                      🔍 Bob - Quality Control
                    </Button>
                    <Button
                      size="small"
                      onClick={() => fillDemoCredentials('ba_carol', 'ba123')}
                      block
                    >
                      📋 Carol - Business Analyst
                    </Button>
                    <Button
                      size="small"
                      onClick={() => fillDemoCredentials('viewer_dave', 'viewer123')}
                      block
                    >
                      👁️ Dave - Viewer Only
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
