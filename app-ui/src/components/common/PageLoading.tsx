'use client';

import React from 'react';
import { Spin, Card, Skeleton } from 'antd';

interface PageLoadingProps {
  type?: 'spin' | 'skeleton' | 'card';
  size?: 'small' | 'default' | 'large';
  rows?: number;
  height?: string | number;
  title?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  type = 'spin',
  size = 'default',
  rows = 4,
  height = '200px',
  title = 'Loading...'
}) => {
  if (type === 'skeleton') {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton active paragraph={{ rows }} />
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div style={{ padding: '24px' }}>
        <Card loading title={title} style={{ minHeight: height }}>
          <div />
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="page-loading"
      style={{ 
        minHeight: height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Spin size={size} tip={title} />
    </div>
  );
};

export default PageLoading;
