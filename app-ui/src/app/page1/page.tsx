'use client';

import React from 'react';
import { Card, Typography, Button } from 'antd';
import { Container } from '@/components/layout';

const { Title, Paragraph } = Typography;

const Page1: React.FC = () => {
  return (
    <Container>
      <div style={{ padding: '24px' }}>
        <Title level={2}>Page 1 - Public Route</Title>
        <Card>
          <Paragraph>
            This is Page 1 content. This page is accessible without authentication.
            The layout is simple and clean for public access.
          </Paragraph>
          <Button type="primary">Sample Action</Button>
        </Card>
      </div>
    </Container>
  );
};

export default Page1;
