'use client';

import React from 'react';
import { Card, Typography, Space, Avatar, Tag, Divider } from 'antd';
import { UserOutlined, CalendarOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Daily } from '@/types/collab';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

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
  const isToday = dayjs(daily.reportDate).isSame(dayjs(), 'day');
  const isYesterday = dayjs(daily.reportDate).isSame(dayjs().subtract(1, 'day'), 'day');

  const getDateLabel = () => {
    if (isToday) return 'Hôm nay';
    if (isYesterday) return 'Hôm qua';
    return dayjs(daily.reportDate).format('DD/MM/YYYY');
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
            <Tag color="red" size="small" icon={<ExclamationCircleOutlined />}>
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
            <Paragraph 
              style={{ 
                margin: '4px 0 0 0', 
                fontSize: compact ? '12px' : '13px',
                lineHeight: 1.4
              }}
              ellipsis={compact ? { rows: 2 } : false}
            >
              {daily.yesterday}
            </Paragraph>
          </div>
        )}

        {/* Today */}
        {daily.today && (
          <div style={{ marginBottom: hasBlockers ? 8 : 0 }}>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 500 }}>
              HÔM NAY:
            </Text>
            <Paragraph 
              style={{ 
                margin: '4px 0 0 0', 
                fontSize: compact ? '12px' : '13px',
                lineHeight: 1.4
              }}
              ellipsis={compact ? { rows: 2 } : false}
            >
              {daily.today}
            </Paragraph>
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
              <Paragraph 
                style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: compact ? '12px' : '13px',
                  lineHeight: 1.4,
                  color: '#ff4d4f'
                }}
                ellipsis={compact ? { rows: 2 } : false}
              >
                {daily.blockers}
              </Paragraph>
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
