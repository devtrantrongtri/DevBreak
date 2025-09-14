'use client';

import React from 'react';
import { Tree, Space, Tag, Tooltip, Button } from 'antd';
import { MenuOutlined, EditOutlined, SafetyCertificateOutlined, DeleteOutlined } from '@ant-design/icons';
import { MenuResponse } from '@/types/api';
import type { DataNode } from 'antd/es/tree';

interface MenuTreeProps {
  menus: MenuResponse[];
  expandedKeys: React.Key[];
  onExpand: (keys: React.Key[]) => void;
  canUpdateMenuName: boolean;
  canRebindPermission: boolean;
  canDeleteMenu: boolean;
  onEditMenu: (menu: MenuResponse) => void;
  onRebindPermission: (menu: MenuResponse) => void;
  onDeleteMenu: (menu: MenuResponse) => void;
}

export const MenuTree: React.FC<MenuTreeProps> = ({
  menus,
  expandedKeys,
  onExpand,
  canUpdateMenuName,
  canRebindPermission,
  canDeleteMenu,
  onEditMenu,
  onRebindPermission,
  onDeleteMenu,
}) => {
  const buildMenuTree = (): DataNode[] => {
    const rootMenus = menus.filter(menu => !menu.parent);
    const childMenus = menus.filter(menu => menu.parent);

    console.log('🌳 Building tree:', {
      totalMenus: menus.length,
      rootMenus: rootMenus.length,
      childMenus: childMenus.length,
      currentExpandedKeys: expandedKeys
    });

    const buildNode = (menu: MenuResponse, isChild = false): DataNode => {
      const nodeKey = `menu_${menu.id}`;
      
      return {
        title: (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '4px 0'
          }}>
            <Space>
              <MenuOutlined style={{ color: isChild ? '#52c41a' : '#1890ff' }} />
              <div>
                <div style={{ fontWeight: isChild ? 400 : 500, fontSize: '13px' }}>
                  {menu.name}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {menu.path}
                </div>
              </div>
              <Tag
                color={isChild ? 'green' : 'blue'}
                style={{ fontSize: '10px', padding: '1px 4px' }}
              >
                {menu.permission?.code || menu.permissionCode}
              </Tag>
            </Space>
            <Space size="small">
              {canUpdateMenuName && (
                <Tooltip title="Sửa tên menu">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMenu(menu);
                    }}
                    style={{
                      borderRadius: 4,
                      color: '#1890ff',
                      padding: '2px 4px'
                    }}
                  />
                </Tooltip>
              )}
              {canRebindPermission && (
                <Tooltip title="Thay đổi quyền">
                  <Button
                    type="text"
                    size="small"
                    icon={<SafetyCertificateOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRebindPermission(menu);
                    }}
                    style={{
                      borderRadius: 4,
                      color: '#52c41a',
                      padding: '2px 4px'
                    }}
                  />
                </Tooltip>
              )}
              {canDeleteMenu && (
                <Tooltip title="Xóa menu">
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMenu(menu);
                    }}
                    style={{
                      borderRadius: 4,
                      color: '#ff4d4f',
                      padding: '2px 4px'
                    }}
                  />
                </Tooltip>
              )}
            </Space>
          </div>
        ),
        key: nodeKey,
        children: [],
      };
    };

    const treeNodes: DataNode[] = [];
    const processedIds = new Set<string>();

    rootMenus.forEach(rootMenu => {
      if (processedIds.has(rootMenu.id)) return;
      
      const rootNode = buildNode(rootMenu, false);
      processedIds.add(rootMenu.id);

      const children = childMenus
        .filter(child => child.parent?.id === rootMenu.id && !processedIds.has(child.id))
        .sort((a, b) => a.order - b.order);
      
      if (children.length > 0) {
        rootNode.children = children.map(child => {
          processedIds.add(child.id);
          return buildNode(child, true);
        });
      }

      treeNodes.push(rootNode);
    });

    return treeNodes.sort((a, b) => {
      const aMenu = rootMenus.find(m => a.key === `menu_${m.id}`);
      const bMenu = rootMenus.find(m => b.key === `menu_${m.id}`);
      return (aMenu?.order || 0) - (bMenu?.order || 0);
    });
  };

  const handleExpand = (keys: React.Key[]) => {
    console.log('🔄 Tree expand/collapse:', { 
      newKeys: keys, 
      previousKeys: expandedKeys,
      action: keys.length > expandedKeys.length ? 'expand' : 'collapse'
    });
    onExpand(keys);
  };

  const menuTree = buildMenuTree();

  if (menuTree.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#999', padding: '50px' }}>
        <MenuOutlined style={{ fontSize: '32px', marginBottom: '16px', color: '#d9d9d9' }} />
        <div style={{ fontSize: '14px' }}>Không có menu nào</div>
        <div style={{ fontSize: '12px', marginTop: 8 }}>
          Hệ thống chưa có menu để hiển thị
        </div>
      </div>
    );
  }

  return (
    <Tree
      treeData={menuTree}
      expandedKeys={expandedKeys}
      onExpand={handleExpand}
      showLine={{ showLeafIcon: false }}
      showIcon={false}
      selectable={false}
      blockNode
      defaultExpandAll={false}
      style={{
        backgroundColor: '#fafafa',
        padding: '16px',
        borderRadius: 6,
        border: '1px solid #f0f0f0'
      }}
      className="custom-menu-tree"
    />
  );
};
