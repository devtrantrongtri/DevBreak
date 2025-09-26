'use client';

import React, { useState, useMemo } from 'react';
import {
  Tree,
  Input,
  Card,
  Space,
  Button,
  Typography,
  Badge,
  Tooltip,
  Dropdown,
  Modal,
  Form,
  message,
  Spin,
  Empty
} from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
  SyncOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import type { DataNode, TreeProps } from 'antd/es/tree';
import type { MenuProps } from 'antd';
import { PermissionResponse } from '@/types/api';

const { Search } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;

interface PermissionModule {
  name: string;
  displayName: string;
  permissions: PermissionResponse[];
}

interface PermissionTreeViewProps {
  permissions: PermissionResponse[];
  modules?: PermissionModule[];
  loading?: boolean;
  onEdit?: (permission: PermissionResponse) => void;
  onDelete?: (permission: PermissionResponse) => void;
  onAdd?: (parentCode?: string) => void;
  onSync?: () => void;
  onRefresh?: () => void;
}

interface PermissionTreeNode extends DataNode {
  key: string;
  title: React.ReactNode;
  children?: PermissionTreeNode[];
  isModule?: boolean;
  isPermission?: boolean;
  permission?: PermissionResponse;
  module?: string;
}

const PermissionTreeView: React.FC<PermissionTreeViewProps> = ({
  permissions,
  modules,
  loading = false,
  onEdit,
  onDelete,
  onAdd,
  onSync,
  onRefresh
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // Build tree data from permissions
  const treeData = useMemo(() => {
    if (modules && modules.length > 0) {
      // Use modules if available
      return buildTreeFromModules(modules, searchValue);
    } else {
      // Fallback to building from permissions
      return buildTreeFromPermissions(permissions, searchValue);
    }
  }, [permissions, modules, searchValue]);

  // Auto expand when searching
  const expandedKeysFromSearch = useMemo(() => {
    if (!searchValue) return [];
    
    const expandedKeys: React.Key[] = [];
    const expandNode = (nodes: PermissionTreeNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          expandedKeys.push(node.key);
          expandNode(node.children);
        }
      });
    };
    
    expandNode(treeData);
    return expandedKeys;
  }, [treeData, searchValue]);

  React.useEffect(() => {
    if (searchValue) {
      setExpandedKeys(expandedKeysFromSearch);
      setAutoExpandParent(true);
    }
  }, [expandedKeysFromSearch, searchValue]);

  const onExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onSelect: TreeProps['onSelect'] = (selectedKeysValue) => {
    setSelectedKeys(selectedKeysValue);
  };

  const handleEdit = (permission: PermissionResponse) => {
    onEdit?.(permission);
  };

  const handleDelete = (permission: PermissionResponse) => {
    confirm({
      title: 'Xác nhận xóa quyền',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa quyền "${permission.name}" (${permission.code})?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        onDelete?.(permission);
      },
    });
  };

  const handleSync = async () => {
    try {
      await onSync?.();
      message.success('Đồng bộ quyền thành công!');
    } catch (error) {
      message.error('Đồng bộ quyền thất bại!');
    }
  };

  const getActionMenu = (permission: PermissionResponse): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: 'Chỉnh sửa',
        icon: <EditOutlined />,
        onClick: () => handleEdit(permission),
      },
      {
        key: 'delete',
        label: 'Xóa',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(permission),
      },
    ],
  });

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải dữ liệu quyền...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có quyền nào được tạo"
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={() => onAdd?.()}>
            Thêm quyền đầu tiên
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 500 }}>
              <SafetyCertificateOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Quản lý Quyền (Tree View)
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Quản lý hệ thống quyền theo cấu trúc cây phân cấp
            </Text>
          </div>
          <Space size="small">
            <Button
              size="small"
              icon={<SyncOutlined />}
              onClick={handleSync}
              style={{ borderRadius: 4 }}
            >
              Đồng bộ
            </Button>
            <Button
              size="small"
              icon={<SearchOutlined />}
              onClick={onRefresh}
              style={{ borderRadius: 4 }}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onAdd?.()}
              style={{ borderRadius: 4 }}
            >
              Thêm quyền
            </Button>
          </Space>
        </div>

        {/* Search */}
        <Search
          placeholder="Tìm kiếm quyền theo tên hoặc mã..."
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ marginBottom: 8 }}
        />
      </div>

      {/* Tree */}
      <Card size="small" style={{ borderRadius: 6 }}>
        <Tree
          showLine={{ showLeafIcon: false }}
          showIcon
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          selectedKeys={selectedKeys}
          onExpand={onExpand}
          onSelect={onSelect}
          treeData={treeData}
          height={600}
          style={{ fontSize: '13px' }}
        />
      </Card>
    </div>
  );
};

// Helper functions
function buildTreeFromModules(modules: PermissionModule[], searchValue: string): PermissionTreeNode[] {
  return modules
    .filter(module => 
      !searchValue || 
      module.displayName.toLowerCase().includes(searchValue.toLowerCase()) ||
      module.permissions.some(p => 
        p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.code.toLowerCase().includes(searchValue.toLowerCase())
      )
    )
    .map(module => ({
      key: `module-${module.name}`,
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Text strong style={{ color: '#1890ff' }}>
              {module.displayName}
            </Text>
            <Badge count={module.permissions.length} size="small" />
          </Space>
        </div>
      ),
      icon: <FolderOutlined style={{ color: '#1890ff' }} />,
      isModule: true,
      module: module.name,
      children: buildPermissionTree(module.permissions, searchValue, module.name)
    }));
}

function buildTreeFromPermissions(permissions: PermissionResponse[], searchValue: string): PermissionTreeNode[] {
  // Group by module (first part of permission code)
  const moduleMap = new Map<string, PermissionResponse[]>();
  
  permissions.forEach(permission => {
    const moduleCode = permission.code.split('.')[0] || 'general';
    if (!moduleMap.has(moduleCode)) {
      moduleMap.set(moduleCode, []);
    }
    moduleMap.get(moduleCode)!.push(permission);
  });

  return Array.from(moduleMap.entries())
    .filter(([module, perms]) => 
      !searchValue || 
      module.toLowerCase().includes(searchValue.toLowerCase()) ||
      perms.some(p => 
        p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.code.toLowerCase().includes(searchValue.toLowerCase())
      )
    )
    .map(([module, perms]) => ({
      key: `module-${module}`,
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Text strong style={{ color: '#1890ff' }}>
              {getModuleDisplayName(module)}
            </Text>
            <Badge count={perms.length} size="small" />
          </Space>
        </div>
      ),
      icon: <FolderOutlined style={{ color: '#1890ff' }} />,
      isModule: true,
      module: module,
      children: buildPermissionTree(perms, searchValue, module)
    }));
}

function buildPermissionTree(permissions: PermissionResponse[], searchValue: string, module: string): PermissionTreeNode[] {
  // Filter permissions based on search
  const filtered = permissions.filter(permission =>
    !searchValue ||
    permission.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    permission.code.toLowerCase().includes(searchValue.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Create a map for quick lookup
  const permissionMap = new Map<string, PermissionResponse>();
  filtered.forEach(p => permissionMap.set(p.code, p));

  // Build hierarchical structure
  const rootNodes: PermissionTreeNode[] = [];
  const processedCodes = new Set<string>();

  // Helper function to create permission node
  const createPermissionNode = (permission: PermissionResponse): PermissionTreeNode => {
    // Find children of this permission
    const children = filtered
      .filter(p => p.parentCode === permission.code)
      .map(child => createPermissionNode(child));

    return {
      key: permission.id,
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <div>
              <Text strong>{permission.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8, fontSize: '11px' }}>
                ({permission.code})
              </Text>
            </div>
            {permission.description && (
              <div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {permission.description}
                </Text>
              </div>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: 'Chỉnh sửa',
                    icon: <EditOutlined />,
                  },
                  {
                    key: 'delete',
                    label: 'Xóa',
                    icon: <DeleteOutlined />,
                    danger: true,
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button
                type="text"
                size="small"
                icon={<SettingOutlined />}
                style={{ opacity: 0.6 }}
              />
            </Dropdown>
          </div>
        </div>
      ),
      icon: children.length > 0
        ? <FolderOutlined style={{ color: '#1890ff' }} />
        : <SafetyCertificateOutlined style={{ color: '#52c41a' }} />,
      isPermission: true,
      permission: permission,
      module: module,
      children: children.length > 0 ? children : undefined,
      isLeaf: children.length === 0
    };
  };

  // Process root permissions (those without parent or parent not in current module)
  filtered.forEach(permission => {
    if (processedCodes.has(permission.code)) return;

    // Check if this is a root permission for this module
    const isRoot = !permission.parentCode ||
                   !permissionMap.has(permission.parentCode) ||
                   !permission.parentCode.startsWith(module);

    if (isRoot) {
      const node = createPermissionNode(permission);
      rootNodes.push(node);

      // Mark this permission and all its descendants as processed
      const markProcessed = (perm: PermissionResponse) => {
        processedCodes.add(perm.code);
        filtered
          .filter(p => p.parentCode === perm.code)
          .forEach(child => markProcessed(child));
      };
      markProcessed(permission);
    }
  });

  return rootNodes;
}

function getModuleDisplayName(moduleName: string): string {
  const displayNames: { [key: string]: string } = {
    'system': 'System Management',
    'user': 'User Management',
    'group': 'Group Management',
    'dashboard': 'Dashboard',
    'audit': 'Audit & Logs',
    'menu': 'Menu Management',
    'general': 'General'
  };

  return displayNames[moduleName] || moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
}

export default PermissionTreeView;
