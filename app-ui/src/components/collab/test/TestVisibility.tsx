'use client';

import React from 'react';
import { Card, Space, Typography } from 'antd';
import VisibilityWrapper from '../common/VisibilityWrapper';

const { Title, Text } = Typography;

const TestVisibility: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Test Component Visibility</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Test Daily Reports */}
        <VisibilityWrapper componentKey="daily-reports">
          <Card title="📊 Daily Reports" size="small">
            <Text>This component should be visible based on daily-reports visibility settings</Text>
          </Card>
        </VisibilityWrapper>

        {/* Test Task Board */}
        <VisibilityWrapper componentKey="task-board">
          <Card title="📋 Task Board" size="small">
            <Text>This component should be visible based on task-board visibility settings</Text>
          </Card>
        </VisibilityWrapper>

        {/* Test Summary */}
        <VisibilityWrapper componentKey="summary">
          <Card title="📈 Summary" size="small">
            <Text>This component should be visible based on summary visibility settings</Text>
          </Card>
        </VisibilityWrapper>

        {/* Test Team Performance */}
        <VisibilityWrapper componentKey="team-performance">
          <Card title="👥 Team Performance" size="small">
            <Text>This component should be visible based on team-performance visibility settings</Text>
          </Card>
        </VisibilityWrapper>
      </Space>
    </div>
  );
};

export default TestVisibility;
