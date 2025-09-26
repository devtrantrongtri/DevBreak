'use client';

import React, { useState, useEffect } from 'react';
import { Tree, Spin, Alert } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import type { DataNode } from 'antd/es/tree';

interface UserMenuTreeProps {
  onMenuSelect?: (menuPath: string) => void;
  className?: string;
}

const UserMenuTree: React.FC<UserMenuTreeProps> = ({ onMenuSelect, className }) => {
  const { menuTree, isLoading } = useAuth();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    // Auto expand root menus
    if (menuTree.length > 0) {
      const rootKeys = menuTree.map(menu => menu.id);
      setExpandedKeys(rootKeys);
    }
  }, [menuTree]);

  const buildTreeData = (menus: Array<{
    id: string;
    name: string;
    path: string;
    icon?: string;
    children?: Array<{ id: string; name: string; path: string; icon?: string }>;
  }>): DataNode[] => {
    return menus.map(menu => ({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MenuOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
          <span style={{ fontSize: '14px' }}>{menu.name}</span>
        </div>
      ),
      key: menu.id,
      children: menu.children ? buildTreeData(menu.children) : [],
    }));
  };

  const handleSelect = (selectedKeys: React.Key[], info: { node: DataNode }) => {
    if (selectedKeys.length > 0 && onMenuSelect) {
      const selectedMenu = findMenuByKey(menuTree, selectedKeys[0] as string);
      if (selectedMenu) {
        onMenuSelect(selectedMenu.path);
      }
    }
  };

  const findMenuByKey = (menus: Array<{
    id: string;
    name: string;
    path: string;
    children?: Array<{ id: string; name: string; path: string }>;
  }>, key: string): { id: string; name: string; path: string } | null => {
    for (const menu of menus) {
      if (menu.id === key) {
        return menu;
      }
      if (menu.children) {
        const found = findMenuByKey(menu.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="small" />
      </div>
    );
  }

  if (menuTree.length === 0) {
    return (
      <Alert
        message="Không có menu"
        description="Bạn chưa được cấp quyền truy cập menu nào."
        type="info"
        showIcon
        style={{ margin: '16px' }}
      />
    );
  }

  return (
    <Tree
      treeData={buildTreeData(menuTree)}
      expandedKeys={expandedKeys}
      onExpand={setExpandedKeys}
      onSelect={handleSelect}
      showLine={{ showLeafIcon: false }}
      showIcon={false}
      blockNode
      className={className}
      style={{
        backgroundColor: 'transparent',
        fontSize: '14px',
      }}
    />
  );
};

export default UserMenuTree;
