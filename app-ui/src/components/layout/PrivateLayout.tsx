import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  MenuOutlined,
  DashboardOutlined,
  LogoutOutlined,
  FileOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
     children: [
          { key: '/dashboard/test', label: 'Test 1' },
          { key: '2', label: 'Option 2' },
        ],
  },
  {
    key: '/page1',
    icon: <FileOutlined />,
    label: 'Page 1',
  },
];

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key.startsWith('/')) {
      router.push(e.key);
    }
    // Close sidebar on mobile after clicking an item
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #303030',
        flexShrink: 0
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>
          {collapsed && !isMobile ? 'L' : 'Logo'}
        </h2>
      </div>

      {/* Menu */}
      <div style={{
        flexGrow: collapsed ? 0 : 1, // Conditionally grow to remove gap when collapsed
        overflowY: 'auto',
        minHeight: 0
      }}>
        <Menu
          theme="dark"
          mode="inline"
          onClick={onClick}
          items={items}
          selectedKeys={[pathname]}
          style={{ border: 'none', backgroundColor: '#001529' }}
        />
      </div>

      {/* Logout */}
      <div style={{ borderTop: '1px solid #303030', flexShrink: 0 }}>
        <Menu
          theme="dark"
          mode="inline"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: collapsed && !isMobile ? '' : 'Logout',
              onClick: () => console.log('Logout clicked')
            }
          ]}
          style={{ border: 'none', backgroundColor: '#001529' }}
        />
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        // On mobile, collapse to 0 to hide it completely
        collapsedWidth={isMobile ? 0 : 80}
        onBreakpoint={(broken) => {
          setIsMobile(broken);
          setCollapsed(broken);
        }}
        style={{
          // Use Ant Design's built-in responsive features
        }}
      >
        {sidebarContent}
      </Sider>

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 5 : 10), transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 99
          }}
        >
          {/* Single button to toggle sidebar */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ marginLeft: 'auto' }}>
            {/* Header actions */}
          </div>
        </Header>

        <Content
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PrivateLayout;
