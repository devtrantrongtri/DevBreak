'use client';

import React from 'react';
import { Card, Typography, Button, Row, Col, Space } from 'antd';
import { useRouter } from 'next/navigation';
import { PublicLayout, Container } from '@/components/layout';

const { Title, Paragraph } = Typography;

export default function Home() {
  const router = useRouter();

  return (
    <PublicLayout>
      <Container>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Title level={1}>Welcome to Our Application</Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            This is a responsive web application built with Next.js and Ant Design.
            Navigate through different sections to explore the features.
          </Paragraph>

          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={12} md={8}>
              <Card
                title="Public Pages"
                hoverable
                actions={[
                  <Button key="page1" onClick={() => router.push('/page1')}>
                    Go to Page 1
                  </Button>
                ]}
              >
                <Paragraph>
                  Explore our public pages that are accessible to everyone without authentication.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card
                title="Dashboard"
                hoverable
                actions={[
                  <Button key="dashboard" type="primary" onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                  </Button>
                ]}
              >
                <Paragraph>
                  Access the private dashboard with sidebar navigation and advanced features.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card
                title="Demo Features"
                hoverable
                actions={[
                  <Button key="demo" onClick={() => router.push('/demo')}>
                    Try Demo
                  </Button>
                ]}
              >
                <Paragraph>
                  Test various features including toast notifications and interactive components.
                </Paragraph>
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: '48px' }}>
            <Space size="large">
              <Button size="large" onClick={() => router.push('/page2')}>
                Page 2
              </Button>
              <Button size="large" onClick={() => router.push('/public')}>
                Public Section
              </Button>
            </Space>
          </div>
        </div>
      </Container>
    </PublicLayout>
  );
}
