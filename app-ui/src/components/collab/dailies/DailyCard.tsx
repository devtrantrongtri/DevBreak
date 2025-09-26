'use client';

import React from 'react';
import { Card, Typography, Space, Avatar, Tag, Divider } from 'antd';
import { UserOutlined, CalendarOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Daily } from '@/types/collab';
import dayjs from 'dayjs';
import '../common/RichTextEditor.scss';

const { Text } = Typography;

interface DailyCardProps {
  daily: Daily;
  showDate?: boolean;
  compact?: boolean;
}

const DailyCard: React.FC<DailyCardProps> = ({
  daily,
  showDate = false,
  compact = false
}) => {
  const hasBlockers = daily.blockers && daily.blockers.trim().length > 0;
  const isToday = dayjs(daily.date).isSame(dayjs(), 'day');
  const isYesterday = dayjs(daily.date).isSame(dayjs().subtract(1, 'day'), 'day');

  // Handle task mention clicks
  const handleTaskMentionClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('task-mention')) {
      const taskId = target.getAttribute('data-task-id');
      if (taskId) {
        console.log('Task mention clicked:', taskId);
        // TODO: Open task details modal or navigate to task
        // For now, just prevent default behavior
        event.preventDefault();
      }
    }
  };

  const getDateLabel = () => {
    if (isToday) return 'Hôm nay';
    if (isYesterday) return 'Hôm qua';
    return dayjs(daily.date).format('DD/MM/YYYY');
  };

  return (
    <Card
      size="small"
      style={{ 
        marginBottom: compact ? 8 : 12,
        border: hasBlockers ? '1px solid #ff7875' : undefined,
        borderLeft: hasBlockers ? '4px solid #ff4d4f' : undefined
      }}
      bodyStyle={{ padding: compact ? 12 : 16 }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12
      }}>
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
            src={daily.user.avatar}
          />
          <Text strong style={{ fontSize: compact ? '13px' : '14px' }}>
            {daily.user.displayName}
          </Text>
        </Space>

        <Space size="small">
          {hasBlockers && (
            <Tag color="red"  icon={<ExclamationCircleOutlined />}>
              Có vướng mắc
            </Tag>
          )}
          {showDate && (
            <Space size={4}>
              <CalendarOutlined style={{ fontSize: '12px', color: '#999' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {getDateLabel()}
              </Text>
            </Space>
          )}
        </Space>
      </div>

      {/* Content */}
      <div style={{ fontSize: compact ? '12px' : '13px' }}>
        {/* Yesterday */}
        {daily.yesterday && (
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 500 }}>
              HÔM QUA:
            </Text>
            <div
              style={{
                margin: '4px 0 0 0',
                fontSize: compact ? '12px' : '13px',
                lineHeight: 1.4
              }}
              onClick={handleTaskMentionClick}
              dangerouslySetInnerHTML={{ __html: daily.yesterday || '' }}
            />
          </div>
        )}

        {/* Today */}
        {daily.today && (
          <div style={{ marginBottom: hasBlockers ? 8 : 0 }}>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 500 }}>
              HÔM NAY:
            </Text>
            <div
              style={{
                margin: '4px 0 0 0',
                fontSize: compact ? '12px' : '13px',
                lineHeight: 1.4
              }}
              onClick={handleTaskMentionClick}
              dangerouslySetInnerHTML={{ __html: daily.today || '' }}
            />
          </div>
        )}

        {/* Blockers */}
        {hasBlockers && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Text 
                type="danger" 
                style={{ fontSize: '11px', fontWeight: 500 }}
              >
                <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                VƯỚNG MẮC:
              </Text>
              <div
                style={{
                  margin: '4px 0 0 0',
                  fontSize: compact ? '12px' : '13px',
                  lineHeight: 1.4,
                  color: '#ff4d4f'
                }}
                onClick={handleTaskMentionClick}
                dangerouslySetInnerHTML={{ __html: daily.blockers || '' }}
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: 8, 
        paddingTop: 8, 
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          {daily.user.email}
        </Text>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          {dayjs(daily.updatedAt).format('HH:mm')}
        </Text>
      </div>
    </Card>
  );
};

export default DailyCard;
