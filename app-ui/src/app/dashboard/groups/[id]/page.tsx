'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Row,
  Col,
  Typography,
  List,
  Avatar,
  Tree,
  Tooltip,
  Badge,
} from 'antd';
import {
  TeamOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { GroupResponse, PermissionResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import type { DataNode } from 'antd/es/tree';

const { Title, Text } = Typography;

const GroupDetailsPage: React.FC = () => {
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { permissions } = useAuth();
  const groupId = params.id as string;

  const canUpdateGroup = permissions.includes('group.update');
  const canAssignPermissions = permissions.includes('group.assignPermissions');

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getGroups();
      const groupDetail = response.find(g => g.id === groupId);
      if (groupDetail) {
        setGroup(groupDetail);
      } else {
        router.push('/dashboard/groups');
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildPermissionTree = (permissions: PermissionResponse[]): DataNode[] => {
    const permissionMap = new Map<string, PermissionResponse>();
    const rootNodes: DataNode[] = [];
    
    // Create a map of all permissions
    permissions.forEach(permission => {
      permissionMap.set(permission.code, permission);
    });

    // Build tree structure
    permissions.forEach(permission => {
      const node: DataNode = {
        title: (
          <Space>
            <SafetyCertificateOutlined />
            <span>{permission.name}</span>
            <Tag size="small">{permission.code}</Tag>
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

  if (loading) {
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

  const permissionTree = group.permissions ? buildPermissionTree(group.permissions) : [];

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
              <TeamOutlined /> Group Details
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            {canAssignPermissions && (
              <Button
                icon={<SafetyCertificateOutlined />}
                onClick={() => router.push(`/dashboard/groups/${groupId}/permissions`)}
              >
                Manage Permissions
              </Button>
            )}
            {canUpdateGroup && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/dashboard/groups/${groupId}/edit`)}
              >
                Edit Group
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Group Information" extra={<TeamOutlined />}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Name">
                {group.name}
              </Descriptions.Item>
              <Descriptions.Item label="Code">
                <Tag color="blue">{group.code}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {group.description || <Text type="secondary">No description</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={group.isActive ? 'green' : 'red'}>
                  {group.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Members">
                <Badge count={group.users?.length || 0} showZero>
                  <UserOutlined /> Users
                </Badge>
              </Descriptions.Item>
              <Descriptions.Item label="Permissions">
                <Badge count={group.permissions?.length || 0} showZero>
                  <SafetyCertificateOutlined /> Permissions
                </Badge>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(group.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {new Date(group.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Group Members" 
            extra={<UserOutlined />}
            actions={canUpdateGroup ? [
              <Button
                key="manage"
                type="link"
                icon={<SettingOutlined />}
                onClick={() => router.push(`/dashboard/groups/${groupId}/members`)}
              >
                Manage Members
              </Button>
            ] : undefined}
          >
            {group.users && group.users.length > 0 ? (
              <List
                dataSource={group.users}
                renderItem={(user) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={user.displayName}
                      description={user.email}
                    />
                    <Tag color={user.isActive ? 'green' : 'red'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                <UserOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>No members in this group</div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24}>
          <Card 
            title="Assigned Permissions" 
            extra={<SafetyCertificateOutlined />}
            actions={canAssignPermissions ? [
              <Button
                key="manage"
                type="link"
                icon={<SettingOutlined />}
                onClick={() => router.push(`/dashboard/groups/${groupId}/permissions`)}
              >
                Manage Permissions
              </Button>
            ] : undefined}
          >
            {permissionTree.length > 0 ? (
              <Tree
                treeData={permissionTree}
                defaultExpandAll
                showLine
                showIcon={false}
                selectable={false}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                <SafetyCertificateOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>No permissions assigned to this group</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GroupDetailsPage;
