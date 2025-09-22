'use client';

import React, { useState } from 'react';
import { Tabs, DatePicker, Space, Button } from 'antd';
import { EditOutlined, TeamOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import DailyForm from './DailyForm';
import DailyList from './DailyList';
import RoleBasedComponent from '../common/RoleBasedComponent';
import ComponentVisibilityControl from '../dashboard/ComponentVisibilityControl';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

interface DailyReportsSectionProps {
  defaultDate?: string;
  onCreateDaily?: () => void;
}

const DailyReportsSection: React.FC<DailyReportsSectionProps> = ({
  defaultDate,
  onCreateDaily
}) => {
  const [selectedDate, setSelectedDate] = useState(
    defaultDate || dayjs().format('YYYY-MM-DD')
  );
  const [activeTab, setActiveTab] = useState('my-daily');
  
  const { currentProject, userRole } = useProject();

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'));
    }
  };

  const handleDailySuccess = () => {
    // Switch to team view after successful daily submission
    if (userRole === 'PM' || userRole === 'BC') {
      setActiveTab('team-dailies');
    }
  };

  if (!currentProject) {
    return null;
  }

  return (
    <div>
      {/* Date Selector and Actions */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <CalendarOutlined />
          <DatePicker
            value={dayjs(selectedDate)}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            allowClear={false}
            size="small"
          />
        </Space>

        {onCreateDaily && (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onCreateDaily}
          >
            Tạo Daily
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        centered
        items={[
          {
            key: 'my-daily',
            label: (
              <Space size="small">
                <EditOutlined />
                <span>Daily của tôi</span>
              </Space>
            ),
            children: (
              <DailyForm
                selectedDate={selectedDate}
                onSuccess={handleDailySuccess}
              />
            )
          },
          {
            key: 'team-dailies',
            label: (
              <RoleBasedComponent
                allowedRoles={['PM', 'BC']}
                showFallback={false}
              >
                <Space size="small">
                  <TeamOutlined />
                  <span>Daily của team</span>
                </Space>
              </RoleBasedComponent>
            ),
            disabled: !['PM', 'BC'].includes(userRole || ''),
            children: (
              <DailyList
                selectedDate={selectedDate}
                compact={false}
                showFilters={true}
              />
            )
          }
        ]}
      />
    </div>
  );
};

export default DailyReportsSection;
