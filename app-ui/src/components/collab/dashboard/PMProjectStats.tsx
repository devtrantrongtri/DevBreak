'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Typography } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedUsers: number;
  averageThroughput: number;
}

interface PMProjectStatsProps {
  stats: ProjectStats;
  reportDate: string;
}

const PMProjectStats: React.FC<PMProjectStatsProps> = ({ stats, reportDate }) => {
  const completionPercentage = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const inProgressTasks = stats.totalTasks - stats.completedTasks;

  return (
    <Card 
      className="pm-project-stats"
      title={
        <Space>
          <TrophyOutlined />
          <span>Tổng quan dự án - {reportDate}</span>
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      <Row gutter={[24, 16]}>
        {/* Overall Progress */}
        <Col xs={24} sm={12} lg={8}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Progress
              type="circle"
              percent={completionPercentage}
              size={80}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={(percent) => `${percent}%`}
            />
            <div style={{ marginTop: 12 }}>
              <Text strong>Tiến độ tổng thể</Text>
              <br />
              <Text type="secondary">
                {stats.completedTasks}/{stats.totalTasks} tasks
              </Text>
            </div>
          </Card>
        </Col>

        {/* Task Statistics */}
        <Col xs={24} sm={12} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Statistic
              title="Tổng số tasks"
              value={stats.totalTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Statistic
              title="Đang thực hiện"
              value={inProgressTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Space>
        </Col>

        {/* Issues & Performance */}
        <Col xs={24} sm={12} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Statistic
              title="Tasks quá hạn"
              value={stats.overdueTasks}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: stats.overdueTasks > 0 ? '#ff4d4f' : '#52c41a' }}
            />
            <Statistic
              title="Thành viên có vướng mắc"
              value={stats.blockedUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: stats.blockedUsers > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Space>
        </Col>

        {/* Performance Metrics */}
        <Col xs={24}>
          <Card size="small" title="Hiệu suất">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Năng suất trung bình"
                  value={stats.averageThroughput}
                  precision={1}
                  suffix="tasks/ngày"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={completionPercentage}
                  suffix="%"
                  valueStyle={{ 
                    color: completionPercentage >= 80 ? '#52c41a' : 
                           completionPercentage >= 60 ? '#fa8c16' : '#ff4d4f' 
                  }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Tasks còn lại"
                  value={inProgressTasks}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default PMProjectStats;
