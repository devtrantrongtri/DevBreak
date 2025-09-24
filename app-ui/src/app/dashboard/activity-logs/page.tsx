'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  message,
  Space,
  Button,
  Breadcrumb,
} from 'antd';
import { 
  ReloadOutlined, 
  DownloadOutlined,
  HomeOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import ActivityLogTable from '@/components/ActivityLogs/ActivityLogTable';
import ActivityLogFilters from '@/components/ActivityLogs/ActivityLogFilters';
import ActivityLogStats from '@/components/ActivityLogs/ActivityLogStats';
import { ActivityLog, ActivityLogFilters as FilterType, PaginatedActivityLogs } from '@/types/activity-logs';

const { Title } = Typography;

const ActivityLogsPage: React.FC = () => {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterType>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchActivityLogs = async (newFilters?: FilterType, page?: number, pageSize?: number) => {
    setLoading(true);
    try {
      // Prepare params object for API call
      const currentFilters = newFilters || filters;
      const apiParams: Record<string, unknown> = {
        page: page || pagination.current,
        limit: pageSize || pagination.pageSize,
      };

      // Add filters to params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          apiParams[key] = value;
        }
      });

      const response = await apiClient.getActivityLogs(apiParams);
      const result: PaginatedActivityLogs = response;

      setData(result.data);
      setPagination(prev => ({
        ...prev,
        current: result.page,
        total: result.total,
      }));
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      message.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters: FilterType) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchActivityLogs(newFilters, 1);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    fetchActivityLogs(filters, page, pageSize);
  };

  const handleRefresh = () => {
    fetchActivityLogs();
  };

  const handleExport = async () => {
    try {
      message.info('Export functionality will be implemented soon');
      // TODO: Implement export functionality
    } catch (error) {
      message.error('Failed to export activity logs');
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/dashboard">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <HistoryOutlined />
          <span>Activity Logs</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>
            Activity Logs
          </Title>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
              type="primary"
            >
              Export
            </Button>
          </Space>
        </Space>
      </div>

      <ActivityLogStats data={data} loading={loading} />

      <ActivityLogFilters 
        onFilter={handleFilter}
        loading={loading}
      />

      <Card>
        <ActivityLogTable
          data={data}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePaginationChange,
          }}
        />
      </Card>
    </div>
  );
};

export default ActivityLogsPage;
