'use client';

import { Card, Statistic, Row, Col, Progress, Typography } from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ActivityLog } from '@/types/activity-logs';

const { Text } = Typography;

interface ActivityLogStatsProps {
  data: ActivityLog[];
  loading?: boolean;
}

const ActivityLogStats: React.FC<ActivityLogStatsProps> = ({
  data,
  loading = false,
}) => {
  // Calculate statistics
  const totalActivities = data.length;
  
  const actionStats = data.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusStats = data.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const resourceStats = data.reduce((acc, log) => {
    acc[log.resource] = (acc[log.resource] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const successRate = totalActivities > 0 
    ? Math.round(((statusStats.success || 0) / totalActivities) * 100)
    : 0;



  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Activities"
            value={totalActivities}
            prefix={<EyeOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Success Rate"
            value={successRate}
            suffix="%"
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: successRate >= 90 ? '#52c41a' : '#faad14' }}
          />
          <Progress 
            percent={successRate} 
            size="small" 
            showInfo={false}
            strokeColor={successRate >= 90 ? '#52c41a' : '#faad14'}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="Errors"
            value={statusStats.error || 0}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <div>
            <Text strong>Top Actions</Text>
            <div style={{ marginTop: 8 }}>
              {Object.entries(actionStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([action, count]) => (
                  <div key={action} style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                      {action}: {count}
                    </Text>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ActivityLogStats;
