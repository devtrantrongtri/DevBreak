import React from 'react';
import { Skeleton, Card, Space } from 'antd';

interface LoadingSkeletonProps {
  type?: 'table' | 'card' | 'list' | 'form' | 'dashboard';
  rows?: number;
  loading?: boolean;
  children?: React.ReactNode;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'table',
  rows = 5,
  loading = true,
  children
}) => {
  if (!loading && children) {
    return <>{children}</>;
  }

  const renderSkeleton = () => {
    switch (type) {
      case 'table':
        return (
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Skeleton.Input style={{ width: 300 }} active />
              <Skeleton active paragraph={{ rows: rows }} />
            </Space>
          </Card>
        );

      case 'card':
        return (
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {Array.from({ length: rows }).map((_, index) => (
              <Card key={index}>
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            ))}
          </div>
        );

      case 'list':
        return (
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {Array.from({ length: rows }).map((_, index) => (
                <Skeleton key={index} active avatar paragraph={{ rows: 1 }} />
              ))}
            </Space>
          </Card>
        );

      case 'form':
        return (
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Skeleton.Input style={{ width: '100%' }} active />
              <Skeleton.Input style={{ width: '100%' }} active />
              <Skeleton.Input style={{ width: '60%' }} active />
              <Skeleton.Button style={{ width: 100 }} active />
            </Space>
          </Card>
        );

      case 'dashboard':
        return (
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <Skeleton active title paragraph={{ rows: 3 }} />
              </Card>
            ))}
          </div>
        );

      default:
        return <Skeleton active paragraph={{ rows }} />;
    }
  };

  return renderSkeleton();
};

export default LoadingSkeleton;
