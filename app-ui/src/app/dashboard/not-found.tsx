'use client';

import React from 'react';
import { Result, Button, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const DashboardNotFound: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div style={{ 
      height: 'calc(100vh - 200px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Trang bạn đang tìm kiếm không tồn tại hoặc chưa được phát triển."
        extra={
          <Space size="middle">
            <Button 
              type="primary" 
              icon={<HomeOutlined />}
              onClick={handleGoHome}
            >
              Về trang chủ
            </Button>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
            >
              Quay lại
            </Button>
          </Space>
        }
      >
        <div style={{ 
          background: '#f6f8fa', 
          padding: '16px', 
          borderRadius: '8px',
          marginTop: '24px',
          textAlign: 'left'
        }}>
          <h4 style={{ marginBottom: '8px', color: '#24292f' }}>
            <SearchOutlined style={{ marginRight: '8px' }} />
            Có thể bạn đang tìm:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#656d76' }}>
            <li>
              <a href="/dashboard" style={{ color: '#0969da' }}>
                Trang chủ Dashboard
              </a>
            </li>
            <li>
              <a href="/dashboard/users" style={{ color: '#0969da' }}>
                Quản lý người dùng
              </a>
            </li>
            <li>
              <a href="/dashboard/groups" style={{ color: '#0969da' }}>
                Quản lý nhóm
              </a>
            </li>
            <li>
              <a href="/dashboard/menus" style={{ color: '#0969da' }}>
                Quản lý menu
              </a>
            </li>
          </ul>
        </div>
      </Result>
    </div>
  );
};

export default DashboardNotFound;
