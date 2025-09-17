import React, { useState, useMemo, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import {
  MenuOutlined,
  DashboardOutlined,
  LogoutOutlined,
  FileOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MenuItem } from '@/types/auth';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const { Header, Sider, Content } = Layout;

type AntdMenuItem = Required<MenuProps>['items'][number];

const getIconByName = (iconName?: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'DashboardOutlined': <DashboardOutlined />,
    'SettingOutlined': <SettingOutlined />,
    'UserOutlined': <UserOutlined />,
    'TeamOutlined': <TeamOutlined />,
    'MenuOutlined': <MenuFoldOutlined />,
    'FileOutlined': <FileOutlined />,
    // Add more icons for better UI
    'SafetyCertificateOutlined': <SettingOutlined />,
    'AuditOutlined': <FileOutlined />,
  };

  return iconMap[iconName || ''] || <FileOutlined />;
};

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, menuTree, logout } = useAuth();
  const { t } = useTranslation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Convert menu tree to Antd menu items with enhanced styling
  const menuItems = useMemo(() => {
    const convertToAntdMenuItem = (item: MenuItem): AntdMenuItem => {
      const antdItem: AntdMenuItem = {
        key: item.path,
        icon: getIconByName(item.icon),
        label: (
          <span style={{
            fontSize: '14px',
            fontWeight: item.children && item.children.length > 0 ? 500 : 400
          }}>
            {item.name}
          </span>
        ),
      };

      if (item.children && item.children.length > 0) {
        (antdItem as any).children = item.children.map(convertToAntdMenuItem);
      }

      return antdItem;
    };

    return menuTree.map(convertToAntdMenuItem);
  }, [menuTree]);

  // Track open submenu keys
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Find if a menu item has children
  // const hasChildren = (path: string): boolean => {
  //   const findItemWithChildren = (items: MenuItem[]): boolean => {
  //     for (const item of items) {
  //       if (item.path === path && item.children && item.children.length > 0) {
  //         return true;
  //       }
  //       if (item.children && item.children.length > 0) {
  //         const found = findItemWithChildren(item.children);
  //         if (found) return true;
  //       }
  //     }
  //     return false;
  //   };
    
  //   return findItemWithChildren(menuTree);
  // };

  const onClick: MenuProps['onClick'] = (e) => {
    // Always navigate to the page if it starts with '/'
    if (e.key.startsWith('/')) {
      router.push(e.key);
      
      // Close sidebar on mobile after clicking an item
      if (isMobile) {
        setCollapsed(true);
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />,
      onClick: () => router.push('/dashboard/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

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
          items={menuItems}
          selectedKeys={[pathname]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          style={{ border: 'none', backgroundColor: '#001529' }}
        />
      </div>

      {/* User Info */}
      <div style={{ borderTop: '1px solid #303030', flexShrink: 0, padding: '16px' }}>
        {!collapsed || isMobile ? (
          <div style={{ color: 'white', textAlign: 'center' }}>
            <div style={{ marginBottom: '8px' }}>
              <Avatar icon={<UserOutlined />} />
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {user?.displayName}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Avatar icon={<UserOutlined />} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout style={{
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 99,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}

      <Sider
        theme="dark"
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        onBreakpoint={(broken) => {
          setIsMobile(broken);
          setCollapsed(broken);
        }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: collapsed ? 'none' : '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        {sidebarContent}
      </Sider>

      <Layout style={{
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 200),
        transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: '64px',
            lineHeight: '64px'
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: '40px',
              height: '40px'
            }}
          />
          <div style={{ marginLeft: 'auto' }}>
            <Space>
              <LanguageSwitcher />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="text" style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '40px',
                  padding: '0 12px'
                }}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span style={{
                    marginLeft: '8px',
                    display: isMobile ? 'none' : 'inline'
                  }}>
                    {user?.displayName}
                  </span>
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content
          style={{
            minHeight: 'calc(100vh - 64px)',
            padding: '0 24px',
            background: '#f5f5f5',
            overflow: 'auto'
          }}
        >
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            background: 'transparent'
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PrivateLayout;
