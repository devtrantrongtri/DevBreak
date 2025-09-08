import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        {children}
      </Content>
    </Layout>
  );
};

export default PublicLayout;
