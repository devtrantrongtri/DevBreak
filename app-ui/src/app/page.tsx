'use client';

import React, { useEffect } from 'react';
import { Card, Typography, Button, Space, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { PublicLayout, Container } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Paragraph } = Typography;

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <PublicLayout>
      <Container>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          textAlign: 'center'
        }}>
          <Card style={{ maxWidth: 600, width: '100%' }}>
            <Title level={1}>Welcome to DevBreak</Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '32px' }}>
              A modern user management system with role-based access control (RBAC).
              Sign in to access your dashboard and manage users, groups, and permissions.
            </Paragraph>

            <Space size="large">
              <Button type="primary" size="large" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button size="large" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </Space>
          </Card>
        </div>
      </Container>
    </PublicLayout>
  );
}
