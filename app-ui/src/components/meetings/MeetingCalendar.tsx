'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Tooltip,
  App,
  Badge,
  Avatar,
  Row,
  Col
} from 'antd';
import {
  VideoCameraOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  UserOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { apiClient } from '@/lib/api';
import { Meeting } from '@/types/meeting';

const { Title, Text } = Typography;

interface MeetingCalendarProps {
  userId?: string;
}

interface CalendarEvent {
  meeting: Meeting;
  startTime: Dayjs;
  endTime: Dayjs;
  duration: number; // in minutes
  color: string;
}

interface DayEvents {
  [hour: number]: CalendarEvent[];
}

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({ userId }) => {
  const router = useRouter();
  const { message } = App.useApp();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(dayjs());

  // Project colors for visual distinction
  const projectColors = useMemo(() => {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];
    const colorMap = new Map<string, string>();
    let colorIndex = 0;
    
    return (projectId: string) => {
      if (!colorMap.has(projectId)) {
        colorMap.set(projectId, colors[colorIndex % colors.length]);
        colorIndex++;
      }
      return colorMap.get(projectId)!;
    };
  }, []);

  // Load user's meetings
  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const meetingsData = await apiClient.getMeetings();
      console.log('Calendar loaded meetings:', meetingsData);
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading meetings:', error);
      message.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Listen for meeting creation events to refresh
  useEffect(() => {
    const handleMeetingCreated = () => {
      console.log('Meeting created event received, refreshing calendar...');
      loadMeetings();
    };

    window.addEventListener('meetingCreated', handleMeetingCreated);
    return () => window.removeEventListener('meetingCreated', handleMeetingCreated);
  }, [loadMeetings]);

  // Process meetings for calendar display
  const calendarEvents = useMemo(() => {
    const weekStart = currentDate.startOf('week');
    const weekEnd = currentDate.endOf('week');
    
    console.log('Processing meetings for calendar:', {
      totalMeetings: meetings.length,
      weekStart: weekStart.format('YYYY-MM-DD'),
      weekEnd: weekEnd.format('YYYY-MM-DD'),
      meetings: meetings.map(m => ({
        title: m.title,
        scheduledStartTime: m.scheduledStartTime,
        startTime: m.startTime,
        projectId: m.projectId
      }))
    });
    
    return meetings
      .filter(meeting => {
        const meetingDate = dayjs(meeting.startTime || meeting.scheduledStartTime);
        const isInWeek = (meetingDate.isAfter(weekStart) || meetingDate.isSame(weekStart, 'day')) && 
                        (meetingDate.isBefore(weekEnd) || meetingDate.isSame(weekEnd, 'day'));
        console.log(`Meeting ${meeting.title}: ${meetingDate.format('YYYY-MM-DD HH:mm')} - Week: ${weekStart.format('YYYY-MM-DD')} to ${weekEnd.format('YYYY-MM-DD')} - In week: ${isInWeek}`);
        return isInWeek;
      })
      .map(meeting => {
        const startTime = dayjs(meeting.startTime || meeting.scheduledStartTime);
        const endTime = dayjs(meeting.endTime || meeting.scheduledEndTime || startTime.add(1, 'hour'));
        const duration = endTime.diff(startTime, 'minute');
        const color = meeting.projectId ? projectColors(meeting.projectId) : '#666';
        
        console.log(`Processing meeting ${meeting.title}:`, {
          startTime: startTime.format('YYYY-MM-DD HH:mm'),
          endTime: endTime.format('YYYY-MM-DD HH:mm'),
          duration,
          color
        });
        
        return {
          meeting,
          startTime,
          endTime,
          duration,
          color
        } as CalendarEvent;
      });
  }, [meetings, currentDate, projectColors]);

  // Group events by day and hour
  const weekEvents = useMemo(() => {
    const weekStart = currentDate.startOf('week');
    const weekData: { [day: number]: DayEvents } = {};
    
    for (let i = 0; i < 7; i++) {
      weekData[i] = {};
    }
    
    console.log('Calendar events to process:', calendarEvents.length);
    
    calendarEvents.forEach(event => {
      const dayOfWeek = event.startTime.diff(weekStart, 'day');
      const hour = event.startTime.hour();
      
      console.log(`Event ${event.meeting.title}: day ${dayOfWeek}, hour ${hour}`);
      
      if (dayOfWeek >= 0 && dayOfWeek < 7) {
        if (!weekData[dayOfWeek][hour]) {
          weekData[dayOfWeek][hour] = [];
        }
        weekData[dayOfWeek][hour].push(event);
      } else {
        console.warn(`Event ${event.meeting.title} is outside week range: day ${dayOfWeek}`);
      }
    });
    
    console.log('Week events data:', weekData);
    const totalEventsInWeek = Object.values(weekData).reduce((total, dayEvents) => 
      total + Object.values(dayEvents).reduce((dayTotal, hourEvents) => dayTotal + hourEvents.length, 0), 0
    );
    console.log('Total events placed in week:', totalEventsInWeek);
    
    return weekData;
  }, [calendarEvents, currentDate]);

  // Calculate overlapping events and blend colors
  const getEventStyle = (events: CalendarEvent[], eventIndex: number) => {
    const event = events[eventIndex];
    const totalEvents = events.length;
    
    if (totalEvents === 1) {
      return {
        backgroundColor: event.color,
        width: '100%',
        left: 0,
        opacity: 0.8
      };
    }
    
    // For overlapping events, blend colors and adjust positioning
    const width = `${100 / totalEvents}%`;
    const left = `${(eventIndex * 100) / totalEvents}%`;
    
    if (totalEvents > 1) {
      // Create blended color for overlapping indication
      const blendedColor = blendColors(events.map(e => e.color));
      return {
        backgroundColor: blendedColor,
        width,
        left,
        opacity: 0.9,
        border: `1px solid ${event.color}`
      };
    }
    
    return {
      backgroundColor: event.color,
      width,
      left,
      opacity: 0.8
    };
  };

  // Simple color blending function
  const blendColors = (colors: string[]): string => {
    if (colors.length === 1) return colors[0];
    if (colors.length === 2) {
      // Simple blend between two colors
      return `linear-gradient(45deg, ${colors[0]} 50%, ${colors[1]} 50%)`;
    }
    // For more than 2 colors, create a striped pattern
    const stops = colors.map((color, index) => 
      `${color} ${(index * 100) / colors.length}%, ${color} ${((index + 1) * 100) / colors.length}%`
    ).join(', ');
    return `linear-gradient(45deg, ${stops})`;
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    if (meeting.status === 'scheduled' && dayjs().isBefore(dayjs(meeting.startTime || meeting.scheduledStartTime))) {
      message.warning('Meeting has not started yet');
      return;
    }
    
    router.push(`/dashboard/meetings/room/${meeting.roomId}`);
  };

  const renderTimeSlots = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const weekStart = currentDate.startOf('week');
    
    return hours.map(hour => (
      <Row key={hour} style={{ minHeight: '60px', borderBottom: '1px solid #f0f0f0' }}>
        <Col span={2} style={{ padding: '8px', borderRight: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {hour.toString().padStart(2, '0')}:00
          </Text>
        </Col>
        {Array.from({ length: 7 }, (_, day) => (
          <Col key={day} span={3} style={{ 
            position: 'relative', 
            borderRight: '1px solid #f0f0f0',
            minHeight: '60px'
          }}>
            {weekEvents[day][hour]?.map((event, index) => (
              <Tooltip
                key={`${event.meeting.id}-${index}`}
                title={
                  <div>
                    <div><strong>{event.meeting.title}</strong></div>
                    <div>{event.meeting.project?.name}</div>
                    <div>
                      {event.startTime.format('HH:mm')} - {event.endTime.format('HH:mm')}
                    </div>
                    <div>{event.meeting.participants?.length || 0} participants</div>
                  </div>
                }
              >
                <div
                  style={{
                    position: 'absolute',
                    top: `${(event.startTime.minute() / 60) * 100}%`,
                    height: `${Math.max((event.duration / 60) * 100, 25)}%`,
                    borderRadius: '4px',
                    padding: '2px 4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: 'white',
                    textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                    zIndex: 10 + index,
                    background: getEventStyle(weekEvents[day][hour], index).backgroundColor,
                    ...getEventStyle(weekEvents[day][hour], index)
                  }}
                  onClick={() => handleJoinMeeting(event.meeting)}
                >
                  <div style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold'
                  }}>
                    {event.meeting.title}
                  </div>
                  <div style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    fontSize: '10px',
                    opacity: 0.9
                  }}>
                    {event.meeting.project?.name}
                  </div>
                </div>
              </Tooltip>
            ))}
          </Col>
        ))}
      </Row>
    ));
  };

  const renderWeekHeader = () => {
    const weekStart = currentDate.startOf('week');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Row style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #d9d9d9' }}>
        <Col span={2} style={{ padding: '12px', borderRight: '1px solid #d9d9d9' }}>
          <Text strong>Time</Text>
        </Col>
        {days.map((day, index) => {
          const currentDay = weekStart.add(index, 'day');
          const isToday = currentDay.isSame(dayjs(), 'day');
          
          return (
            <Col key={day} span={3} style={{ 
              padding: '12px', 
              borderRight: '1px solid #d9d9d9',
              backgroundColor: isToday ? '#e6f7ff' : 'transparent'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div>
                  <Text strong style={{ color: isToday ? '#1890ff' : undefined }}>
                    {day}
                  </Text>
                </div>
                <div>
                  <Text 
                    style={{ 
                      fontSize: '18px', 
                      fontWeight: isToday ? 'bold' : 'normal',
                      color: isToday ? '#1890ff' : undefined
                    }}
                  >
                    {currentDay.date()}
                  </Text>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined />
          <span>Meeting Calendar</span>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<LeftOutlined />} 
            onClick={() => setCurrentDate(prev => prev.subtract(1, 'week'))}
          />
          <Button onClick={() => setCurrentDate(dayjs())}>
            Today
          </Button>
          <Button 
            icon={<RightOutlined />} 
            onClick={() => setCurrentDate(prev => prev.add(1, 'week'))}
          />
          <Text strong>
            {currentDate.startOf('week').format('MMM DD')} - {currentDate.endOf('week').format('MMM DD, YYYY')}
          </Text>
        </Space>
      }
      loading={loading}
    >
      <div style={{ 
        overflowX: 'auto', 
        overflowY: 'auto', 
        maxHeight: '600px',
        border: '1px solid #d9d9d9',
        borderRadius: '6px'
      }}>
        {renderWeekHeader()}
        {renderTimeSlots()}
      </div>
      
      {/* Legend */}
      <div style={{ marginTop: '16px' }}>
        <Text strong>Projects: </Text>
        <Space wrap>
          {Array.from(new Set(meetings.map(m => m.projectId).filter(Boolean))).map(projectId => {
            const project = meetings.find(m => m.projectId === projectId)?.project;
            return (
              <Tag key={projectId} color={projectColors(projectId!)}>
                {project?.name || 'Unknown Project'}
              </Tag>
            );
          })}
        </Space>
      </div>
    </Card>
  );
};

export default MeetingCalendar;
