'use client';

import React from 'react';
import { Card, Typography, Space, Button, Spin } from 'antd';
import { MoreOutlined, ReloadOutlined } from '@ant-design/icons';
import ComponentVisibilityControl from './ComponentVisibilityControl';

const { Title } = Typography;

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  span?: 1 | 2;
  extra?: React.ReactNode;
  onRefresh?: () => void;
  className?: string;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  componentKey?: string; // For visibility control
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  loading = false,
  span = 1,
  extra,
  onRefresh,
  className = '',
  style,
  bodyStyle,
  headerStyle,
  componentKey
}) => {
  const cardClassName = `dashboard-card ${span === 2 ? 'span-2' : ''} ${className}`.trim();

  const cardExtra = (
    <Space size="small">
      {extra}
      {componentKey && (
        <ComponentVisibilityControl componentKey={componentKey} />
      )}
      {onRefresh && (
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
          style={{ padding: '4px' }}
        />
      )}
    </Space>
  );

  return (
    <Card
      className={cardClassName}
      style={style}
      styles={{ body: {
        padding: 0,
        ...bodyStyle
      }}}
      title={
        <div style={{ display: 'flex', alignItems: 'center', ...headerStyle }}>
          <Title level={5} style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            {title}
          </Title>
        </div>
      }
      extra={cardExtra}
      loading={loading}
    >
      <div className="card-content" style={{
        maxHeight: title === 'Task Board' ? 'none' : '400px',
        overflowY: title === 'Task Board' ? 'visible' : 'auto',
        padding: title === 'Task Board' ? '0' : '20px',
        position: 'relative' // Ensure proper positioning context
      }}>
        {children}
      </div>
    </Card>
  );
};

export default DashboardCard;
