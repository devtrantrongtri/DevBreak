'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Space,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Tree,
  Checkbox,
} from 'antd';
import {
  TeamOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { CreateGroupDto, PermissionResponse } from '@/types/api';
import type { DataNode } from 'antd/es/tree';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateGroupPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await apiClient.getPermissions();
      setPermissions(response);
      // Expand all parent nodes by default
      const parentKeys = response
        .filter(p => !p.parentCode)
        .map(p => p.code);
      setExpandedKeys(parentKeys);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleSubmit = async (values: CreateGroupDto) => {
    try {
      setLoading(true);
      
      // Create group first
      const newGroup = await apiClient.createGroup(values);
      
      // Assign permissions if any selected
      if (selectedPermissions.length > 0) {
        await apiClient.assignGroupPermissions(newGroup.id, selectedPermissions);
      }
      
      message.success('Group created successfully');
      router.push('/dashboard/groups');
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || 'Failed to create group';
      message.error(errorMessage);
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCode = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Group code is required'));
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return Promise.reject(new Error('Group code can only contain letters, numbers, underscores, and hyphens'));
    }
    return Promise.resolve();
  };

  const buildPermissionTree = (): DataNode[] => {
    const permissionMap = new Map<string, PermissionResponse>();
    const rootNodes: DataNode[] = [];
    
    // Create a map of all permissions
    permissions.forEach(permission => {
      permissionMap.set(permission.code, permission);
    });

    // Build tree structure
    permissions.forEach(permission => {
      const isSelected = selectedPermissions.includes(permission.code);
      const node: DataNode = {
        title: (
          <Space>
            <Checkbox
              checked={isSelected}
              onChange={(e) => handlePermissionToggle(permission.code, e.target.checked)}
            >
              {permission.name}
            </Checkbox>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({permission.code})
            </Text>
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
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionCode]);
    } else {
      setSelectedPermissions(prev => prev.filter(code => code !== permissionCode));
    }
  };

  const handleSelectAll = () => {
    setSelectedPermissions(permissions.map(p => p.code));
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  const permissionTree = buildPermissionTree();

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/dashboard/groups')}
            >
              Back to Groups
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <TeamOutlined /> Create New Group
            </Title>
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Group Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                isActive: true,
              }}
            >
              <Form.Item
                name="name"
                label="Group Name"
                rules={[
                  { required: true, message: 'Group name is required' },
                  { min: 2, message: 'Group name must be at least 2 characters' },
                  { max: 50, message: 'Group name cannot exceed 50 characters' },
                ]}
              >
                <Input
                  placeholder="Enter group name"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="code"
                label="Group Code"
                rules={[{ validator: validateCode }]}
                extra="Unique identifier for the group (letters, numbers, underscores, and hyphens only)"
              >
                <Input
                  placeholder="Enter group code"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea
                  placeholder="Enter group description (optional)"
                  rows={4}
                />
              </Form.Item>

              <Form.Item
                name="isActive"
                label="Status"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>

              <Divider />

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    Create Group
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard/groups')}
                    size="large"
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Assign Permissions" 
            extra={<SafetyCertificateOutlined />}
            actions={[
              <Button key="select-all" type="link" onClick={handleSelectAll}>
                Select All
              </Button>,
              <Button key="deselect-all" type="link" onClick={handleDeselectAll}>
                Deselect All
              </Button>,
            ]}
          >
            <div style={{ marginBottom: 16 }}>
              <Text>
                Selected: <strong>{selectedPermissions.length}</strong> of {permissions.length} permissions
              </Text>
            </div>
            
            {permissionTree.length > 0 ? (
              <Tree
                treeData={permissionTree}
                expandedKeys={expandedKeys}
                onExpand={setExpandedKeys}
                showLine
                showIcon={false}
                selectable={false}
                height={400}
                style={{ overflow: 'auto' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                <SafetyCertificateOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>No permissions available</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateGroupPage;
