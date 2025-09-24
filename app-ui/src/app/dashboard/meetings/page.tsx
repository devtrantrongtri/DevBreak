'use client';

import React, { useState } from 'react';
import { Card, Tabs, Space, Button } from 'antd';
import { CalendarOutlined, UnorderedListOutlined, PlusOutlined } from '@ant-design/icons';
import MeetingsList from '@/components/meetings/MeetingsList';
import MeetingCalendar from '@/components/meetings/MeetingCalendar';
import { useRouter } from 'next/navigation';

const MeetingsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="My Meetings"
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => router.push('/dashboard/collab')}
            >
              Create Meeting in Project
            </Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'calendar',
              label: (
                <Space>
                  <CalendarOutlined />
                  Calendar View
                </Space>
              ),
              children: <MeetingCalendar />
            },
            {
              key: 'list',
              label: (
                <Space>
                  <UnorderedListOutlined />
                  List View
                </Space>
              ),
              children: <MeetingsList showCreateButton={false} />
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default MeetingsPage;
