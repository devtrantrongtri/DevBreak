'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Avatar,
  Tag,
  Typography,
  Space,
  Button,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { UserResponse, GroupResponse } from '@/types/api';

const { Title, Text } = Typography;

interface UserStatsProps {
  onViewAllUsers?: () => void;
}

const UserStats: React.FC<UserStatsProps> = ({ onViewAllUsers }) => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, groupsResponse] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getGroups(),
      ]);
      setUsers(usersResponse);
      setGroups(groupsResponse);
    } catch (error) {
      console.error('Error fetching stats data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeUsers = users.filter(user => user.isActive);
  const inactiveUsers = users.filter(user => !user.isActive);
  const activePercentage = users.length > 0 ? (activeUsers.length / users.length) * 100 : 0;

  const recentUsers = users
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const groupStats = groups.map(group => ({
    ...group,
    userCount: users.filter(user => 
      user.groups?.some(userGroup => userGroup.id === group.id)
    ).length,
  })).sort((a, b) => b.userCount - a.userCount);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={users.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={activeUsers.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Inactive Users"
              value={inactiveUsers.length}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Groups"
              value={groups.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TrophyOutlined />
                <span>User Activity Status</span>
              </Space>
            }
            loading={loading}
          >
            <div style={{ marginBottom: 16 }}>
              <Text>Active Users: {activeUsers.length} / {users.length}</Text>
              <Progress 
                percent={Math.round(activePercentage)} 
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Active Rate"
                    value={activePercentage}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Inactive Rate"
                    value={100 - activePercentage}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#ff4d4f', fontSize: '18px' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                <span>Groups Overview</span>
              </Space>
            }
            loading={loading}
          >
            <List
              size="small"
              dataSource={groupStats}
              renderItem={(group) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<TeamOutlined />} size="small" />}
                    title={group.name}
                    description={group.description}
                  />
                  <div>
                    <Tag color="blue">{group.userCount} users</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>Recent Users</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={onViewAllUsers}>
                View All Users
              </Button>
            }
            loading={loading}
          >
            <List
              dataSource={recentUsers}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <span>{user.displayName}</span>
                        <Tag color={user.isActive ? 'green' : 'red'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">{user.email}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                  <div>
                    {user.groups && user.groups.length > 0 ? (
                      <Space wrap>
                        {user.groups.map(group => (
                          <Tag key={group.id} style={{ fontSize: '12px', padding: '0 6px' }}>
                            {group.name}
                          </Tag>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        No groups
                      </Text>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserStats;
