'use client';

import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { Container } from '@/components/layout';

const { Title, Paragraph } = Typography;

const Test: React.FC = () => {
  return (
    <Container>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <Title level={2}>Test - Private Route</Title>
        
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Total Users" value={1128} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Revenue" value={93} suffix="%" />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Orders" value={1893} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Growth" value={12.5} suffix="%" />
            </Card>
          </Col>
        </Row>

        <Card>
          <Title level={4}>Welcome to Dashboard</Title>
          <Paragraph>
            This is the main dashboard page with sidebar navigation. 
            The layout is responsive and includes a collapsible sidebar for desktop 
            and a drawer for mobile devices.
          </Paragraph>
        </Card>
      </div>
    </Container>
  );
};

export default Test;
