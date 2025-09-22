'use client';

import React from 'react';
import { Layout, Space, Typography, Breadcrumb } from 'antd';
import { HomeOutlined, ProjectOutlined } from '@ant-design/icons';
import { ProjectProvider } from '@/contexts/ProjectContext';
import ProjectSelector from './ProjectSelector';

const { Header, Content } = Layout;
const { Title } = Typography;

interface CollabLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: Array<{ title: string; href?: string }>;
}

const CollabLayout: React.FC<CollabLayoutProps> = ({ 
  children, 
  title = 'Collab Hub',
  breadcrumb = []
}) => {
  const defaultBreadcrumb = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Collab Hub' }
  ];

  const finalBreadcrumb = breadcrumb.length > 0 ? breadcrumb : defaultBreadcrumb;

  return (
    <ProjectProvider>
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Header style={{ 
          background: 'white', 
          padding: '0 6px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Space>
              <ProjectOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                {title}
              </Title>
            </Space>
            
            <Breadcrumb
              items={finalBreadcrumb.map(item => ({
                title: item.href ? (
                  <a href={item.href}>{item.title}</a>
                ) : item.title
              }))}
            />
          </div>

          <ProjectSelector size="small" />
        </Header>

        <Content style={{ 
          padding: '0px',
          background: '#f5f5f5'
        }}>
          {children}
        </Content>
      </Layout>
    </ProjectProvider>
  );
};

export default CollabLayout;
