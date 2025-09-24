'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col,
  Card,
  Spin,
  Empty,
  message
} from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  CalendarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { format, addDays, subDays, parseISO } from 'date-fns';
import dayjs, { Dayjs } from 'dayjs';
import { PMDashboardData, ViewMode, ChartType } from '@/types/collab';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';
// import { generateMockPMDashboardData } from '@/data/mockPMDashboardData';
import PMUserProgressRow from './PMUserProgressRow';
import PMProjectStats from './PMProjectStats';
import VisibilityWrapper from '../common/VisibilityWrapper';
import './PMDailyReportDashboard.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface PMDailyReportDashboardProps {
  className?: string;
  projectId?: string;
  projectName?: string;
}

const PMDailyReportDashboard: React.FC<PMDailyReportDashboardProps> = ({
  className = '',
  projectId: propProjectId,
  projectName: propProjectName
}) => {
  // Try to get project from context, fallback to props
  let currentProject = null;
  let projectFromContext = false;

  // Always call useProject hook, but handle the case where context might not be available
  const projectContext = useProject();

  if (projectContext?.currentProject) {
    currentProject = projectContext.currentProject;
    projectFromContext = true;
  } else if (propProjectId) {
    // Fallback to props if context is not available
    currentProject = {
      id: propProjectId,
      name: propProjectName || 'Unknown Project',
      code: propProjectId,
      status: 'active' as const,
      createdBy: '',
      createdAt: '',
      updatedAt: '',
      creator: { id: '', displayName: '', email: '' },
      members: [],
      memberCount: 0,
      isActive: true
    };
  }

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<PMDashboardData | null>(null);
  
  // View controls
  const [viewMode, setViewMode] = useState<ViewMode>('single-row');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chartType, setChartType] = useState<ChartType>('progress');
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [isRangeMode, setIsRangeMode] = useState(false);

  // Convert Date to dayjs for Ant Design components
  const selectedDateDayjs = dayjs(selectedDate);
  const dateRangeDayjs: [Dayjs, Dayjs] | null = dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null;

  // Initialize date range when project changes
  useEffect(() => {
    if (currentProject?.startDate) {
      const startDate = parseISO(currentProject.startDate);
      const endDate = new Date();
      setDateRange([startDate, endDate]);
    }
  }, [currentProject]);

  // Load dashboard data
  const loadDashboardData = async (date: Date, projectId: string) => {
    if (!projectId) return;

    setLoading(true);
    try {
      // Get data from API
      const data = await apiClient.getPMDashboardData(projectId, format(date, 'yyyy-MM-dd'));
      setDashboardData(data);
      console.log('✅ Loaded real dashboard data from API:', data);
    } catch (error) {
      console.error('❌ Failed to load dashboard data from API:', error);
      message.error('Không thể tải dữ liệu dashboard từ server');

      // Fallback to mock data only in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔄 Using mock data as fallback in development mode');
        // const mockData = generateMockPMDashboardData(projectId, format(date, 'yyyy-MM-dd'));
        setDashboardData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data when date or project changes
  useEffect(() => {
    if (currentProject?.id) {
      loadDashboardData(selectedDate, currentProject.id);
    }
  }, [selectedDate, currentProject?.id]);

  // Navigation handlers
  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date.toDate());
    }
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null, _dateStrings: [string, string]) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      setDateRange([dates[0].toDate(), dates[1].toDate()]);
    } else {
      setDateRange(null);
    }
  };

  const viewModeOptions = [
    { value: 'single-row', label: 'Một hàng', icon: <DashboardOutlined /> },
    { value: 'grid', label: 'Lưới', icon: <BarChartOutlined /> },
    { value: 'compact', label: 'Gọn', icon: <LineChartOutlined /> }
  ];

  const chartTypeOptions = [
    { value: 'progress', label: 'Tiến độ', icon: <BarChartOutlined /> },
    { value: 'throughput', label: 'Năng suất', icon: <LineChartOutlined /> },
    { value: 'status', label: 'Trạng thái', icon: <PieChartOutlined /> },
    { value: 'workload', label: 'Khối lượng', icon: <DashboardOutlined /> }
  ];

  if (!currentProject) {
    return (
      <div className="pm-dashboard-empty">
        <Empty description="Vui lòng chọn dự án hoặc truyền projectId để xem báo cáo" />
      </div>
    );
  }

  return (
    <div className={`pm-daily-report-dashboard ${className}`}>
      {/* Header Controls */}
      <div className="dashboard-header">
        <div className="header-left">
          <Title level={4} style={{ margin: 0 }}>
            Báo cáo Daily - {currentProject.name}
          </Title>
        </div>
        
        <div className="header-controls">
          <Space size="middle">
            {/* View Mode Selector */}
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 120 }}
              options={viewModeOptions.map(opt => ({
                ...opt,
                label: (
                  <Space>
                    {opt.icon}
                    {opt.label}
                  </Space>
                )
              }))}
            />

            {/* Chart Type Selector */}
            <Select
              value={chartType}
              onChange={setChartType}
              style={{ width: 140 }}
              options={chartTypeOptions.map(opt => ({
                ...opt,
                label: (
                  <Space>
                    {opt.icon}
                    {opt.label}
                  </Space>
                )
              }))}
            />

            {/* Range Mode Toggle */}
            <Button
              type={isRangeMode ? 'primary' : 'default'}
              onClick={() => setIsRangeMode(!isRangeMode)}
              icon={<CalendarOutlined />}
            >
              {isRangeMode ? 'Khoảng ngày' : 'Theo ngày'}
            </Button>
          </Space>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="date-navigation">
        <Space size="middle">
          <Button
            icon={<LeftOutlined />}
            onClick={handlePreviousDay}
            disabled={loading}
          >
            Hôm trước
          </Button>

          {isRangeMode ? (
            <RangePicker
              value={dateRangeDayjs}
              onChange={handleRangeChange}
              format="DD/MM/YYYY"
              allowClear={false}
            />
          ) : (
            <DatePicker
              value={selectedDateDayjs}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              allowClear={false}
            />
          )}

          <Button
            icon={<RightOutlined />}
            onClick={handleNextDay}
            disabled={loading}
          >
            Hôm sau
          </Button>
        </Space>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : dashboardData ? (
          <>
            {/* Project Stats */}
            <PMProjectStats
              stats={dashboardData.projectStats}
              reportDate={format(selectedDate, 'dd/MM/yyyy')}
            />

            {/* Team Progress */}
            <div className={`team-progress-container view-mode-${viewMode}`}>
              {dashboardData.teamProgress.map((userProgress) => (
                <PMUserProgressRow
                  key={userProgress.userId}
                  userProgress={userProgress}
                  chartType={chartType}
                  isRangeMode={isRangeMode}
                  dateRange={dateRange}
                  selectedDate={selectedDate}
                  viewMode={viewMode}
                  onTaskClick={(taskId) => {
                    // TODO: Navigate to task in kanban
                    console.log('Navigate to task:', taskId);
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <Empty description="Không có dữ liệu" />
        )}
      </div>
    </div>
  );
};

export default PMDailyReportDashboard;
