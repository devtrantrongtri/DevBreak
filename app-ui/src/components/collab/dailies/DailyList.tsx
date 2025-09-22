'use client';

import React, { useState, useEffect } from 'react';
import { Space, Input, Select, Empty, Spin, Alert } from 'antd';
import { SearchOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { Daily } from '@/types/collab';
import { apiClient } from '@/lib/api';
import DailyCard from './DailyCard';
import RoleBasedComponent from '../common/RoleBasedComponent';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

interface DailyListProps {
  selectedDate?: string;
  compact?: boolean;
  showFilters?: boolean;
}

const DailyList: React.FC<DailyListProps> = ({ 
  selectedDate,
  compact = false,
  showFilters = true
}) => {
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all'); // all, with_blockers, no_blockers
  
  const { currentProject } = useProject();
  const reportDate = selectedDate || dayjs().format('YYYY-MM-DD');

  // Load dailies when project or date changes
  useEffect(() => {
    if (currentProject) {
      loadDailies();
    }
  }, [currentProject, reportDate]);

  const loadDailies = async () => {
    if (!currentProject) return;

    try {
      setLoading(true);
      const url = `/collab/dailies?projectId=${currentProject.id}&date=${reportDate}`;
      console.log('[DailyList] Loading dailies from:', url);

      const response = await apiClient.request<Daily[]>(url);
      console.log('[DailyList] Loaded dailies:', response.length, 'items');
      console.log('[DailyList] Dailies data:', response);

      setDailies(response);
    } catch (error: any) {
      console.error('Failed to load dailies:', error);
      console.error('Error details:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });

      // Check if it's a permission error
      if (error?.response?.status === 403) {
        console.log('[DailyList] Permission denied - user may not have collab.dailies.view permission');
      }

      setDailies([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter dailies based on search and filters
  const filteredDailies = dailies.filter((daily, index) => {
    // Debug each daily
    if (index === 0) {
      console.log('[DailyList] Filtering first daily:', {
        daily,
        searchText,
        filterUser,
        filterType,
        dailyUserId: daily.userId,
        dailyUser: daily.user
      });
    }

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        daily.user?.displayName?.toLowerCase().includes(searchLower) ||
        daily.user?.email?.toLowerCase().includes(searchLower) ||
        daily.yesterday?.toLowerCase().includes(searchLower) ||
        daily.today?.toLowerCase().includes(searchLower) ||
        daily.blockers?.toLowerCase().includes(searchLower);

      if (!matchesSearch) {
        console.log('[DailyList] Filtered out by search:', daily.id);
        return false;
      }
    }

    // User filter
    if (filterUser !== 'all' && daily.userId !== filterUser) {
      console.log('[DailyList] Filtered out by user filter:', {
        dailyUserId: daily.userId,
        filterUser,
        dailyId: daily.id
      });
      return false;
    }

    // Type filter
    if (filterType === 'with_blockers' && (!daily.blockers || daily.blockers.trim().length === 0)) {
      console.log('[DailyList] Filtered out by blockers filter (with_blockers):', daily.id);
      return false;
    }
    if (filterType === 'no_blockers' && daily.blockers && daily.blockers.trim().length > 0) {
      console.log('[DailyList] Filtered out by blockers filter (no_blockers):', daily.id);
      return false;
    }

    console.log('[DailyList] Daily passed all filters:', daily.id);
    return true;
  });

  // Debug logging
  useEffect(() => {
    if (dailies.length > 0) {
      console.log('[DailyList] Debug Info:', {
        totalDailies: dailies.length,
        filteredDailies: filteredDailies.length,
        currentProject: currentProject?.name,
        reportDate,
        searchText,
        filterUser,
        filterType,
        apiUrl: `/collab/dailies?projectId=${currentProject?.id}&date=${reportDate}`,
        sampleDaily: dailies[0],
        // Check filter states
        filterStates: {
          searchTextEmpty: !searchText,
          filterUserIsAll: filterUser === 'all',
          filterTypeIsAll: filterType === 'all'
        }
      });

      // If we have dailies but no filtered results, something is wrong
      if (filteredDailies.length === 0) {
        console.warn('[DailyList] ⚠️ Have dailies but no filtered results! Check filter logic.');
      }
    }
  }, [dailies, filteredDailies, currentProject, reportDate, searchText, filterUser, filterType]);

  // Get unique users for filter
  const users = Array.from(new Set(dailies.map(d => d.userId)))
    .map(userId => dailies.find(d => d.userId === userId)?.user)
    .filter(Boolean);

  const blockersCount = dailies.filter(d => d.blockers && d.blockers.trim().length > 0).length;

  if (!currentProject) {
    return (
      <Alert
        message="Chưa chọn dự án"
        description="Vui lòng chọn dự án để xem daily reports"
        type="info"
        showIcon
      />
    );
  }

  return (
    <RoleBasedComponent allowedRoles={['PM', 'BC']}>
      <div>
        {/* Filters */}
        {showFilters && (
          <div style={{ marginBottom: 16 }}>
            <Space wrap size="small">
              <Search
                placeholder="Tìm kiếm daily..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                size="small"
                prefix={<SearchOutlined />}
              />

              <Select
                value={filterUser}
                onChange={setFilterUser}
                style={{ width: 150 }}
                size="small"
                placeholder="Chọn người"
              >
                <Option value="all">Tất cả</Option>
                {users.map(user => (
                  <Option key={user!.id} value={user!.id}>
                    {user!.displayName}
                  </Option>
                ))}
              </Select>

              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 120 }}
                size="small"
              >
                <Option value="all">Tất cả</Option>
                <Option value="with_blockers">Có vướng mắc</Option>
                <Option value="no_blockers">Không vướng mắc</Option>
              </Select>
            </Space>

            {/* Stats */}
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              <Space split={<span>•</span>}>
                <span>
                  <TeamOutlined /> {dailies.length} daily
                </span>
                {blockersCount > 0 && (
                  <span style={{ color: '#ff4d4f' }}>
                    {blockersCount} vướng mắc
                  </span>
                )}
                <span>
                  <CalendarOutlined /> {dayjs(reportDate).format('DD/MM/YYYY')}
                </span>
              </Space>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : filteredDailies.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              dailies.length === 0
                ? "Chưa có daily nào cho ngày này"
                : "Không tìm thấy daily phù hợp với bộ lọc"
            }
          />
        ) : (
          <div>
            {filteredDailies.map(daily => (
              <DailyCard
                key={daily.id}
                daily={daily}
                compact={compact}
                showDate={false}
              />
            ))}
          </div>
        )}
      </div>
    </RoleBasedComponent>
  );
};

export default DailyList;
