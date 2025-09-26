'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { apiClient } from '@/lib/api';
import { UserResponse, GroupResponse } from '@/types/api';
import { DashboardStats, GrowthData } from '@/types/dashboard';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface SystemChartsProps {
  onViewUsers?: () => void;
  onViewGroups?: () => void;
}

const SystemCharts: React.FC<SystemChartsProps> = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, groupsResponse, statsResponse, growthResponse] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getGroups(),
        apiClient.getDashboardStats(),
        apiClient.getUserGrowthData(6),
      ]);
      setUsers(usersResponse);
      setGroups(groupsResponse);
      setDashboardStats(statsResponse);
      setGrowthData(growthResponse);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const activeUsers = users.filter(user => user.isActive);
  const inactiveUsers = users.filter(user => !user.isActive);
  
  const userStatusData = [
    { name: 'Hoạt động', value: activeUsers.length, color: '#52c41a' },
    { name: 'Không hoạt động', value: inactiveUsers.length, color: '#ff4d4f' },
  ];

  const groupUserData = groups.map(group => ({
    name: group.name,
    users: users.filter(user => 
      user.groups?.some(userGroup => userGroup.id === group.id)
    ).length,
    permissions: group.permissions?.length || 0,
  }));

  // Transform growth data for chart
  const monthlyData = growthData.map(item => ({
    month: item.month.substring(5), // Get MM part from YYYY-MM
    monthName: item.monthName.substring(0, 3), // Short month name
    users: item.newUsers,
    groups: item.newGroups,
    totalUsers: item.totalUsers,
    totalGroups: item.totalGroups,
  }));



  return (
    <div>
      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={dashboardStats?.totalUsers || users.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={dashboardStats?.totalUsers ? 100 : (users.length > 0 ? 100 : 0)}
              showInfo={false}
              strokeColor="#1890ff"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng hoạt động"
              value={dashboardStats?.activeUsers || activeUsers.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress
              percent={dashboardStats?.totalUsers ?
                Math.round((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100) :
                (users.length > 0 ? Math.round((activeUsers.length / users.length) * 100) : 0)
              }
              showInfo={false}
              strokeColor="#52c41a"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng nhóm"
              value={dashboardStats?.totalGroups || groups.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress
              percent={dashboardStats?.totalGroups ? 100 : (groups.length > 0 ? 100 : 0)}
              showInfo={false}
              strokeColor="#722ed1"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ lệ hoạt động"
              value={users.length > 0 ? Math.round((activeUsers.length / users.length) * 100) : 0}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <Progress 
              percent={users.length > 0 ? Math.round((activeUsers.length / users.length) * 100) : 0}
              showInfo={false}
              strokeColor="#fa8c16"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <PieChartOutlined />
                <span>Phân bố trạng thái người dùng</span>
              </Space>
            }
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                <span>Người dùng theo nhóm</span>
              </Space>
            }
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={groupUserData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Trend Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>Xu hướng tăng trưởng theo tháng</span>
              </Space>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.monthName} ${data.year || ''}`;
                    }
                    return label;
                  }}
                  formatter={(value, name) => [
                    value,
                    name === 'users' ? 'Người dùng mới' : 'Nhóm mới'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.6}
                  name="users"
                />
                <Area
                  type="monotone"
                  dataKey="groups"
                  stackId="2"
                  stroke="#52c41a"
                  fill="#52c41a"
                  fillOpacity={0.6}
                  name="groups"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      {/* <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>Hoạt động gần đây</span>
              </Space>
            }
          >
            <ActivityLog
              activities={recentActivities}
              loading={loading}
              showUser={true}
              limit={10}
              height={400}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Thống kê nhanh">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Người dùng mới hôm nay</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  +{dashboardStats?.newUsersToday || 0}
                </div>
              </div>
              <Divider />
              <div>
                <Text type="secondary">Đăng nhập hôm nay</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {dashboardStats?.loginsTodayCount || 0}
                </div>
              </div>
              <Divider />
              <div>
                <Text type="secondary">Nhóm có nhiều người nhất</Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#722ed1' }}>
                  {dashboardStats?.mostActiveGroup?.name ||
                    (groupUserData.length > 0 ?
                      groupUserData.reduce((prev, current) =>
                        prev.users > current.users ? prev : current
                      ).name : 'N/A'
                    )
                  }
                </div>
                {dashboardStats?.mostActiveGroup?.userCount && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dashboardStats.mostActiveGroup.userCount} thành viên
                  </Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>
      </Row> */}
    </div>
  );
};

export default SystemCharts;
