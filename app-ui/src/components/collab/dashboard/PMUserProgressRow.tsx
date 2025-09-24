'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Space, 
  Tag, 
  Button, 
  Popover,
  Tooltip,
  Row,
  Col
} from 'antd';
import { 
  UpOutlined, 
  DownOutlined, 
  UserOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { addDays } from 'date-fns';
import { UserProgressData, ChartType, ViewMode, Task } from '@/types/collab';
import PMUserChart from './PMUserChart';
import TaskPreviewPopover from './TaskPreviewPopover';

const { Text, Paragraph } = Typography;

interface PMUserProgressRowProps {
  userProgress: UserProgressData;
  chartType: ChartType;
  isRangeMode: boolean;
  dateRange: [Date, Date] | null;
  selectedDate: Date;
  viewMode: ViewMode;
  onTaskClick: (taskId: string) => void;
}

const PMUserProgressRow: React.FC<PMUserProgressRowProps> = ({
  userProgress,
  chartType,
  isRangeMode,
  dateRange,
  selectedDate,
  viewMode,
  onTaskClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userDateOffset, setUserDateOffset] = useState(0); // For individual user date navigation

  const { user, role, dailyReport, taskStats } = userProgress;
  const hasBlockers = dailyReport?.blockers && dailyReport.blockers.trim().length > 0;
  
  // Calculate user's current date (independent of main dashboard date)
  const userCurrentDate = addDays(selectedDate, userDateOffset);

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PM': return '#722ed1';
      case 'BC': return '#1890ff';
      case 'DEV': return '#52c41a';
      case 'QC': return '#fa8c16';
      default: return '#666';
    }
  };

  // Get completion percentage
  const completionPercentage = taskStats.total > 0 
    ? Math.round((taskStats.done / taskStats.total) * 100) 
    : 0;

  // Parse task mentions in daily report
  const parseTaskMentions = (text: string) => {
    if (!text) return text;

    // Remove HTML tags first and extract task mentions
    const cleanText = text.replace(/<[^>]*>/g, '');

    // Simple regex for @mentions
    const taskRegex = /@([A-Z]+-\d+|NEW-\d+|TASK-\d+)/g;
    const parts = cleanText.split(taskRegex);

    return parts.map((part, index) => {
      if (part && part.match(/^[A-Z]+-\d+$|^NEW-\d+$|^TASK-\d+$/)) {
        return (
          <TaskPreviewPopover
            key={`task-${index}`}
            taskId={part}
            onTaskClick={onTaskClick}
          >
            <Text
              strong
              style={{
                color: '#1890ff',
                cursor: 'pointer',
                textDecoration: 'underline',
                background: '#e6f4ff',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #91caff'
              }}
            >
              @{part}
            </Text>
          </TaskPreviewPopover>
        );
      }
      return part;
    });
  };

  // Handle user date navigation
  const handleUserDateChange = (direction: 'prev' | 'next') => {
    setUserDateOffset(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const renderDailyContent = () => {
    if (!dailyReport) {
      return (
        <div className="no-daily-report">
          <Text type="secondary">Chưa có báo cáo daily</Text>
        </div>
      );
    }

    return (
      <div className="daily-content">
        {dailyReport.yesterday && (
          <div className="daily-section">
            <Text strong>Hôm qua đã làm:</Text>
            <Paragraph style={{ marginBottom: 8, marginTop: 4 }}>
              {parseTaskMentions(dailyReport.yesterday)}
            </Paragraph>
          </div>
        )}

        {dailyReport.today && (
          <div className="daily-section">
            <Text strong>Hôm nay sẽ làm:</Text>
            <Paragraph style={{ marginBottom: 8, marginTop: 4 }}>
              {parseTaskMentions(dailyReport.today)}
            </Paragraph>
          </div>
        )}

        {dailyReport.blockers && (
          <div className="daily-section blockers">
            <Text strong style={{ color: '#ff4d4f' }}>
              <ExclamationCircleOutlined /> Vướng mắc:
            </Text>
            <Paragraph style={{ marginBottom: 0, marginTop: 4, color: '#ff4d4f' }}>
              {parseTaskMentions(dailyReport.blockers)}
            </Paragraph>
          </div>
        )}
      </div>
    );
  };

  const renderTaskStats = () => (
    <div className="task-stats">
      <Space size="small" wrap>
        <Tag color="default">Tổng: {taskStats.total}</Tag>
        <Tag color="green">Hoàn thành: {taskStats.done}</Tag>
        <Tag color="blue">Đang làm: {taskStats.in_process}</Tag>
        <Tag color="orange">Chờ QC: {taskStats.ready_for_qc}</Tag>
        <Tag color="red">Quá hạn: {taskStats.overdue}</Tag>
      </Space>
      <div style={{ marginTop: 8 }}>
        <Text type="secondary">
          Hoàn thành hôm nay: <Text strong>{taskStats.completedToday}</Text> | 
          Tiến độ: <Text strong>{completionPercentage}%</Text>
        </Text>
      </div>
    </div>
  );

  return (
    <Card 
      className={`pm-user-progress-row ${hasBlockers ? 'has-blockers' : ''}`}
      bodyStyle={{ padding: 0 }}
      style={{ 
        marginBottom: 16,
        border: hasBlockers ? '1px solid #ff7875' : undefined,
        borderLeft: hasBlockers ? '4px solid #ff4d4f' : undefined
      }}
    >
      <Row style={{ minHeight: viewMode === 'single-row' ? 120 : 'auto' }}>
        {/* Left Chart Section - 30% */}
        <Col span={7} className="chart-section">
          <div style={{ padding: 16, height: '100%' }}>
            <PMUserChart
              userProgress={userProgress}
              chartType={chartType}
              isRangeMode={isRangeMode}
              dateRange={dateRange}
              selectedDate={userCurrentDate}
              height={viewMode === 'single-row' ? 88 : 120}
            />
          </div>
        </Col>

        {/* Right Info Section - 70% */}
        <Col span={17} className="info-section">
          <div style={{ padding: 16 }}>
            {/* User Header */}
            <div className="user-header">
              <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Avatar 
                    src={user.avatar} 
                    icon={<UserOutlined />}
                    style={{ backgroundColor: getRoleColor(role) }}
                  >
                    {!user.avatar && user.displayName.charAt(0)}
                  </Avatar>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>{user.displayName}</Text>
                    <br />
                    <Tag color={getRoleColor(role)} style={{ marginTop: 4 }}>
                      {role}
                    </Tag>
                    {hasBlockers && (
                      <Tag color="red" icon={<ExclamationCircleOutlined />}>
                        Có vướng mắc
                      </Tag>
                    )}
                  </div>
                </Space>

                <Space>
                  {/* User Date Navigation */}
                  <Button
                    size="small"
                    icon={<UpOutlined />}
                    onClick={() => handleUserDateChange('prev')}
                    title="Xem daily ngày trước"
                  />
                  <Text type="secondary" style={{ minWidth: 80, textAlign: 'center' }}>
                    {userDateOffset === 0 ? 'Hôm nay' :
                     userDateOffset === -1 ? 'Hôm qua' :
                     userCurrentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </Text>
                  <Button
                    size="small"
                    icon={<DownOutlined />}
                    onClick={() => handleUserDateChange('next')}
                    disabled={userDateOffset >= 0}
                    title="Xem daily ngày sau"
                  />

                  {/* Expand/Collapse */}
                  <Button
                    size="small"
                    type="text"
                    icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                    onClick={() => setIsExpanded(!isExpanded)}
                  />
                </Space>
              </Space>
            </div>

            {/* Daily Content */}
            <div className="daily-report-content" style={{ marginTop: 12 }}>
              {renderDailyContent()}
            </div>

            {/* Task Stats */}
            {isExpanded && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                {renderTaskStats()}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default PMUserProgressRow;
