'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Input,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Badge,
  Switch,
  Spin,
  App,
} from 'antd';
import {
  MenuOutlined,
  ReloadOutlined,
  SettingOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { MenuResponse, PermissionResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  MenuTree,
  MenuTable,
  EditMenuModal,
  RebindPermissionModal,
  AddMenuModal,
  DeleteMenuModal,
} from '@/components/MenuManagement';

const { Title, Text } = Typography;
const { Search } = Input;

const MenusPage: React.FC = () => {
  const { message } = App.useApp();
  const [menus, setMenus] = useState<MenuResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [rebindModalVisible, setRebindModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuResponse | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { permissions: userPermissions } = useAuth();

  const canUpdateMenuName = userPermissions.includes('menu.updateName');
  const canRebindPermission = userPermissions.includes('menu.rebindPermission');
  const canCreateMenu = userPermissions.includes('system.menus.manage');
  const canDeleteMenu = userPermissions.includes('system.menus.manage');

  const canViewMenus = userPermissions.includes('system.menus.manage');

  // Filtered menus based on search
  const filteredMenus = useMemo(() => {
    return menus.filter(menu =>
      menu.name.toLowerCase().includes(searchText.toLowerCase()) ||
      menu.path.toLowerCase().includes(searchText.toLowerCase()) ||
      (menu.permission?.code || menu.permissionCode || '').toLowerCase().includes(searchText.toLowerCase())
    );
  }, [menus, searchText]);

  // Event handlers
  const handleExpand = (keys: React.Key[]) => {
    console.log('🔄 Tree expand/collapse:', { 
      newKeys: keys, 
      previousKeys: expandedKeys,
      action: keys.length > expandedKeys.length ? 'expand' : 'collapse'
    });
    setExpandedKeys(keys);
  };

  const openEditModal = (menu: MenuResponse) => {
    setSelectedMenu(menu);
    setEditModalVisible(true);
  };

  const openRebindModal = (menu: MenuResponse) => {
    setSelectedMenu(menu);
    setRebindModalVisible(true);
  };

  const handleUpdateName = async (values: { name: string }) => {
    if (!selectedMenu) return;
    
    setUpdateLoading(true);
    try {
      await apiClient.updateMenuName(selectedMenu.id, values.name);
      message.success('Cập nhật tên menu thành công');
      setEditModalVisible(false);
      fetchMenus();
    } catch (error: any) {
      console.error('Update menu name error:', error);
      message.error(error.message || 'Cập nhật tên menu thất bại');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRebindPermission = async (values: { permissionCode: string }) => {
    if (!selectedMenu) return;

    try {
      setUpdateLoading(true);
      await apiClient.rebindMenuPermission(selectedMenu.id, values.permissionCode);
      message.success('Cập nhật quyền menu thành công');
      setRebindModalVisible(false);
      fetchMenus();
    } catch (error) {
      message.error('Không thể cập nhật quyền menu');
      console.error('Error rebinding permission:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteMenu = (menu: MenuResponse) => {
    setSelectedMenu(menu);
    setDeleteModalVisible(true);
  };

  useEffect(() => {
    if (canViewMenus) {
      fetchMenus();
      fetchPermissions();
    }
  }, [canViewMenus]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMenus();
      console.log('📋 Menu data received:', response);

      // Ensure no duplicates and proper structure
      const menuMap = new Map();
      response.forEach((menu: MenuResponse) => {
        if (!menuMap.has(menu.id)) {
          menuMap.set(menu.id, menu);
        }
      });
      
      const uniqueMenus = Array.from(menuMap.values());
      const sortedMenus = uniqueMenus.sort((a, b) => {
        if (!a.parent && b.parent) return -1;
        if (a.parent && !b.parent) return 1;
        return a.order - b.order;
      });

      setMenus(sortedMenus);

      // Auto expand root menus
      const rootMenuKeys = sortedMenus
        .filter(menu => !menu.parent)
        .map(menu => `menu_${menu.id}`);
      setExpandedKeys(rootMenuKeys);

      message.success('Tải danh sách menu thành công');
    } catch (error) {
      message.error('Không thể tải danh sách menu');
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await apiClient.getPermissions();
      setPermissions(response);
    } catch (error) {
      message.error('Không thể tải danh sách quyền');
      console.error('Error fetching permissions:', error);
    }
  };

  // Clean up expanded keys when menus change
  useEffect(() => {
    const validKeys = expandedKeys.filter(key => {
      const menuId = key.toString().replace('menu_', '');
      return menus.some(menu => menu.id === menuId);
    });
    
    if (validKeys.length !== expandedKeys.length) {
      setExpandedKeys(validKeys);
    }
  }, [menus, expandedKeys]);

  if (!canViewMenus) {
    return (
      <div style={{ padding: '0 5px' }}>
        <Row justify="center">
          <Col xs={24} sm={16} md={12} lg={8}>
            <Card style={{ textAlign: 'center', borderRadius: 6 }}>
              <div style={{ padding: '40px 20px' }}>
                <MenuOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={4} style={{ color: '#666', marginBottom: '8px' }}>
                  Không có quyền truy cập
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Bạn không có quyền xem và quản lý menu hệ thống.
                  <br />
                  Vui lòng liên hệ quản trị viên để được cấp quyền.
                </Text>
                <div style={{ marginTop: '24px' }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => window.history.back()}
                    style={{ borderRadius: 4, boxShadow: 'none' }}
                  >
                    Quay lại
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 5px' }}>
      <style jsx>{`
        .custom-table :global(.ant-table-thead > tr > th) {
          background-color: #fafafa !important;
          font-weight: 500 !important;
          font-size: 12px !important;
        }
        .custom-menu-tree :global(.ant-tree-node-content-wrapper) {
          width: 100% !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
        }
        .custom-menu-tree :global(.ant-tree-node-content-wrapper:hover) {
          background-color: #e6f7ff !important;
        }
        .custom-menu-tree :global(.ant-tree-title) {
          width: 100% !important;
        }
        .custom-menu-tree :global(.ant-tree-switcher) {
          background: none !important;
        }
      `}</style>
      
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 0 }}>
        <Col>
          <Title level={3} style={{ margin: 0, fontWeight: 500 }}>
            <MenuOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Quản lý Menu
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Quản lý cấu trúc menu và phân quyền truy cập
          </Text>
        </Col>
        <Col>
          <Space>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={fetchMenus}
              loading={loading}
              style={{ borderRadius: 4, boxShadow: 'none' }}
            >
              Làm mới
            </Button>
            {canCreateMenu && (
              <Button
                type="primary"
                size="small"
                icon={<MenuOutlined />}
                onClick={() => setAddModalVisible(true)}
                style={{ borderRadius: 4, boxShadow: 'none' }}
              >
                Thêm menu
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Controls */}
      <Card size="small" style={{ marginBottom: 0, borderRadius: 6 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm menu theo tên, đường dẫn hoặc quyền..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              size="small"
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>Hiển thị:</Text>
              <Switch
                checkedChildren="Cây"
                unCheckedChildren="Bảng"
                checked={viewMode === 'tree'}
                onChange={(checked) => setViewMode(checked ? 'tree' : 'table')}
                size="small"
              />
            </Space>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Badge count={filteredMenus.length} showZero>
              <Text type="secondary" style={{ fontSize: '12px' }}>Tổng menu</Text>
            </Badge>
          </Col>
        </Row>
      </Card>

      {/* Content Area */}
      <Card style={{ borderRadius: 6, minHeight: 'calc(100vh - 280px)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Đang tải danh sách menu...</Text>
            </div>
          </div>
        ) : viewMode === 'tree' ? (
          <div>
            <div style={{ marginBottom: 0 }}>
              <Text strong style={{ fontSize: '14px' }}>
                <BranchesOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                Cấu trúc cây menu
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', marginLeft: 16 }}>
                Hiển thị cấu trúc phân cấp của menu ({menus.length} menu)
              </Text>
            </div>
            <MenuTree
              menus={filteredMenus}
              expandedKeys={expandedKeys}
              onExpand={handleExpand}
              canDeleteMenu={canDeleteMenu}
              onDeleteMenu={handleDeleteMenu}
              canUpdateMenuName={canUpdateMenuName}
              canRebindPermission={canRebindPermission}
              onEditMenu={openEditModal}
              onRebindPermission={openRebindModal}
            />
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 0 }}>
              <Text strong style={{ fontSize: '14px' }}>
                <SettingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Danh sách menu
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', marginLeft: 16 }}>
                Quản lý chi tiết từng menu
              </Text>
            </div>
            <MenuTable
              menus={filteredMenus}
              permissions={permissions}
              loading={false}
              canUpdateMenuName={canUpdateMenuName}
              canRebindPermission={canRebindPermission}
              canDeleteMenu={canDeleteMenu}
              onEditMenu={openEditModal}
              onRebindPermission={openRebindModal}
              onDeleteMenu={handleDeleteMenu}
            />
          </div>
        )}
      </Card>

      {/* Modals */}
      <EditMenuModal
        visible={editModalVisible}
        loading={updateLoading}
        selectedMenu={selectedMenu}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleUpdateName}
      />

      <RebindPermissionModal
        visible={rebindModalVisible}
        loading={updateLoading}
        selectedMenu={selectedMenu}
        permissions={permissions}
        onCancel={() => setRebindModalVisible(false)}
        onSubmit={handleRebindPermission}
      />

      <AddMenuModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={fetchMenus}
        permissions={permissions}
        menus={menus}
      />

      <DeleteMenuModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onSuccess={() => {
          setDeleteModalVisible(false);
          fetchMenus();
        }}
        selectedMenu={selectedMenu}
      />
    </div>
  );
};

export default MenusPage;
