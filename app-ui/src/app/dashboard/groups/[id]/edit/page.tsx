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
        message.error('Không tìm thấy nhóm');
        router.push('/dashboard/groups');
      }
    } catch (error) {
      message.error('Không thể tải thông tin nhóm');
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
      
      message.success('Cập nhật nhóm thành công');
      router.push(`/dashboard/groups/${groupId}` );
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Không thể cập nhật nhóm';
      message.error(errorMessage);
      console.error('Error updating group:', error);
    } finally {
      setLoading(false);
    }
  };


  const validateCode = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Mã nhóm là bắt buộc'));
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return Promise.reject(new Error('Mã nhóm chỉ được chứa chữ cái, số, dấu gạch dưới và gạch ngang'));
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
        <Text>Không tìm thấy nhóm</Text>
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
              onClick={() => router.push(`/dashboard/groups/${groupId}` )}
            >
              Quay lại chi tiết nhóm
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <TeamOutlined /> Chỉnh sửa nhóm
            </Title>
          </Space>
        </Col>
      </Row>


      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Thông tin nhóm">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="name"
                label="Tên nhóm"
                rules={[
                  { required: true, message: 'Tên nhóm là bắt buộc' },
                  { min: 2, message: 'Tên nhóm phải có ít nhất 2 ký tự' },
                  { max: 50, message: 'Tên nhóm không được vượt quá 50 ký tự' },
                ]}
              >
                <Input
                  placeholder="Nhập tên nhóm"
                  size="large"
                />
              </Form.Item>


              <Form.Item
                name="code"
                label="Mã nhóm"
                rules={[{ validator: validateCode }]}
                extra="Định danh duy nhất cho nhóm (chỉ chứa chữ cái, số, dấu gạch dưới và gạch ngang)"
              >
                <Input
                  placeholder="Nhập mã nhóm"
                  size="large"
                  disabled // Usually don't allow changing code after creation
                />
              </Form.Item>


              <Form.Item
                name="description"
                label="Mô tả"
              >
                <TextArea
                  placeholder="Nhập mô tả nhóm (tùy chọn)"
                  rows={4}
                />
              </Form.Item>


              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Không hoạt động"
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
                    Cập nhật nhóm
                  </Button>
                  <Button
                    onClick={() => router.push(`/dashboard/groups/${groupId}` )}
                    size="large"
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>


        <Col xs={24} lg={12}>
          <Card 
            title="Phân quyền" 
            extra={<SafetyCertificateOutlined />}
            actions={[
              <Button key="select-all" type="link" onClick={handleSelectAll}>
                Chọn tất cả
              </Button>,
              <Button key="deselect-all" type="link" onClick={handleDeselectAll}>
                Bỏ chọn tất cả
              </Button>,
            ]}
          >
            <div style={{ marginBottom: 16 }}>
              <Text>
                Đã chọn: <strong>{selectedPermissions.length}</strong> trong tổng số {permissions.length} quyền hạn
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
                <div>Không có quyền hạn nào</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};


export default EditGroupPage;