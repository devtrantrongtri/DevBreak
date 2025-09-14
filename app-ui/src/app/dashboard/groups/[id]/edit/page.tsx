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
  Spin,
} from 'antd';
import {
  TeamOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { UpdateGroupDto, GroupResponse, PermissionResponse } from '@/types/api';
import type { DataNode } from 'antd/es/tree';

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditGroupPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
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
        setSelectedPermissions(groupDetail.permissions?.map(p => p.code) || []);
        
        // Set form values
        form.setFieldsValue({
          name: groupDetail.name,
          code: groupDetail.code,
          description: groupDetail.description,
          isActive: groupDetail.isActive,
        });

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

  const handleSubmit = async (values: UpdateGroupDto) => {
    try {
      setLoading(true);
      
      // Update group basic info
      await apiClient.updateGroup(groupId, values);
      
      // Update permissions
      await apiClient.assignGroupPermissions(groupId, selectedPermissions);
      
      message.success('Group updated successfully');
      router.push(`/dashboard/groups/${groupId}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update group';
      message.error(errorMessage);
      console.error('Error updating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCode = (_: any, value: string) => {
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
              <TeamOutlined /> Edit Group
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
                  disabled // Usually don't allow changing code after creation
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
                    Update Group
                  </Button>
                  <Button
                    onClick={() => router.push(`/dashboard/groups/${groupId}`)}
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

export default EditGroupPage;
