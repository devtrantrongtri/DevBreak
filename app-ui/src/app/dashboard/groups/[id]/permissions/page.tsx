'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  message,
  Row,
  Col,
  Typography,
  Tree,
  Checkbox,
  Spin,
  Alert,
  Divider,
  Tag,
  Tooltip,
} from 'antd';
import {
  TeamOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { GroupResponse, PermissionResponse } from '@/types/api';
import type { DataNode } from 'antd/es/tree';

const { Title, Text } = Typography;

const GroupPermissionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  useEffect(() => {
    if (groupId) {
      fetchGroupAndPermissions();
    }
  }, [groupId]);

  const fetchGroupAndPermissions = async () => {
    try {
      setPageLoading(true);
      const [groupsResponse, permissionsResponse] = await Promise.all([
        apiClient.getGroups(),
        apiClient.getPermissions()
      ]);
      
      const groupDetail = groupsResponse.find(g => g.id === groupId);
      if (groupDetail) {
        setGroup(groupDetail);
        setPermissions(permissionsResponse);
        const currentPermissions = groupDetail.permissions?.map(p => p.code) || [];
        setSelectedPermissions(currentPermissions);
        setOriginalPermissions(currentPermissions);
        
        // Expand all parent nodes by default
        const parentKeys = permissionsResponse
          .filter(p => !p.parentCode)
          .map(p => p.code);
        setExpandedKeys(parentKeys);
      } else {
        message.error('Group not found');
        router.push('/dashboard/groups');
      }
    } catch (error) {
      message.error('Failed to fetch group details');
      console.error('Error fetching group details:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiClient.assignGroupPermissions(groupId, selectedPermissions);
      setOriginalPermissions([...selectedPermissions]);
      message.success('Permissions updated successfully');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update permissions';
      message.error(errorMessage);
      console.error('Error updating permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildPermissionTree = (): DataNode[] => {
    const permissionMap = new Map<string, PermissionResponse>();
    const rootNodes: DataNode[] = [];
    
    // Create a map of all permissions
    permissions.forEach(permission => {
      permissionMap.set(permission.code, permission);
    });

    // Build tree structure with enhanced UI
    permissions.forEach(permission => {
      const isSelected = selectedPermissions.includes(permission.code);
      const wasOriginallySelected = originalPermissions.includes(permission.code);
      const isChanged = isSelected !== wasOriginallySelected;
      
      let statusIcon = null;
      let statusColor = '';
      
      if (isChanged) {
        if (isSelected) {
          statusIcon = <CheckCircleOutlined style={{ color: '#52c41a' }} />;
          statusColor = '#52c41a';
        } else {
          statusIcon = <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
          statusColor = '#ff4d4f';
        }
      }

      const node: DataNode = {
        title: (
          <Space>
            <Checkbox
              checked={isSelected}
              onChange={(e) => handlePermissionToggle(permission.code, e.target.checked)}
            >
              <Space>
                <span style={{ color: isChanged ? statusColor : undefined }}>
                  {permission.name}
                </span>
                {statusIcon}
              </Space>
            </Checkbox>
            <Tag size="small" color={isSelected ? 'blue' : 'default'}>
              {permission.code}
            </Tag>
            {permission.description && (
              <Tooltip title={permission.description}>
                <InfoCircleOutlined style={{ color: '#999' }} />
              </Tooltip>
            )}
          </Space>
        ),
        key: permission.code,
        children: [],
      };

      if (!permission.parentCode) {
        rootNodes.push(node);
      } else {
        // Find parent and add as child
        const parent = findNodeByKey(rootNodes, permission.parentCode);
        if (parent && parent.children) {
          parent.children.push(node);
        } else {
          // If parent not found, add as root
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  };

  const findNodeByKey = (nodes: DataNode[], key: string): DataNode | null => {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = findNodeByKey(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const handlePermissionToggle = (permissionCode: string, checked: boolean) => {
    const permission = permissions.find(p => p.code === permissionCode);
    if (!permission) return;

    if (checked) {
      // Add permission and ensure all parent permissions are also added
      const newPermissions = new Set(selectedPermissions);
      newPermissions.add(permissionCode);
      
      // Add all parent permissions
      let currentPermission = permission;
      while (currentPermission?.parentCode) {
        newPermissions.add(currentPermission.parentCode);
        currentPermission = permissions.find(p => p.code === currentPermission?.parentCode);
      }
      
      setSelectedPermissions(Array.from(newPermissions));
    } else {
      // Remove permission and all child permissions
      const permissionsToRemove = new Set([permissionCode]);
      
      // Find all child permissions recursively
      const findChildren = (parentCode: string) => {
        permissions
          .filter(p => p.parentCode === parentCode)
          .forEach(child => {
            permissionsToRemove.add(child.code);
            findChildren(child.code);
          });
      };
      
      findChildren(permissionCode);
      
      setSelectedPermissions(prev => 
        prev.filter(code => !permissionsToRemove.has(code))
      );
    }
  };

  const handleSelectAll = () => {
    setSelectedPermissions(permissions.map(p => p.code));
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleReset = () => {
    setSelectedPermissions([...originalPermissions]);
  };

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!group) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Group not found</Text>
      </div>
    );
  }

  const permissionTree = buildPermissionTree();
  const hasChanges = JSON.stringify(selectedPermissions.sort()) !== JSON.stringify(originalPermissions.sort());
  const addedCount = selectedPermissions.filter(p => !originalPermissions.includes(p)).length;
  const removedCount = originalPermissions.filter(p => !selectedPermissions.includes(p)).length;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/dashboard/groups/${groupId}`)}
            >
              Back to Group Details
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <SafetyCertificateOutlined /> Manage Permissions
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            {hasChanges && (
              <Button onClick={handleReset}>
                Reset Changes
              </Button>
            )}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                <span>Group: {group.name}</span>
                <Tag color="blue">{group.code}</Tag>
              </Space>
            }
          >
            {group.description && (
              <Text type="secondary">{group.description}</Text>
            )}
          </Card>
        </Col>

        <Col xs={24}>
          {hasChanges && (
            <Alert
              message="Unsaved Changes"
              description={
                <Space>
                  {addedCount > 0 && <Tag color="green">+{addedCount} added</Tag>}
                  {removedCount > 0 && <Tag color="red">-{removedCount} removed</Tag>}
                  <span>Click "Save Changes" to apply these modifications.</span>
                </Space>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Card 
            title="Permission Assignment" 
            extra={<SafetyCertificateOutlined />}
            actions={[
              <Button key="select-all" type="link" onClick={handleSelectAll}>
                Select All ({permissions.length})
              </Button>,
              <Button key="deselect-all" type="link" onClick={handleDeselectAll}>
                Deselect All
              </Button>,
            ]}
          >
            <div style={{ marginBottom: 16 }}>
              <Space split={<Divider type="vertical" />}>
                <Text>
                  Selected: <strong>{selectedPermissions.length}</strong> of {permissions.length}
                </Text>
                {hasChanges && (
                  <Text type="warning">
                    <ExclamationCircleOutlined /> {addedCount + removedCount} changes pending
                  </Text>
                )}
              </Space>
            </div>
            
            <Alert
              message="Permission Hierarchy Rules"
              description="Selecting a parent permission automatically includes all child permissions. Removing a parent permission removes all child permissions. This ensures proper access control hierarchy."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            {permissionTree.length > 0 ? (
              <Tree
                treeData={permissionTree}
                expandedKeys={expandedKeys}
                onExpand={setExpandedKeys}
                showLine
                showIcon={false}
                selectable={false}
                height={500}
                style={{ overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: '6px', padding: '12px' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                <SafetyCertificateOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>No permissions available</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GroupPermissionsPage;
