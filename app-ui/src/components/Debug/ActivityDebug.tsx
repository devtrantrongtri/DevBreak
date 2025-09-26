'use client';

import { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Collapse, Tag, Statistic, Row, Col } from 'antd';
import { BugOutlined, ReloadOutlined } from '@ant-design/icons';
// activityCache service đã được xóa

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface ActivityDebugProps {
  show?: boolean;
}

const ActivityDebug: React.FC<ActivityDebugProps> = ({ show = false }) => {
  const [cacheStats, setCacheStats] = useState<{
    totalEntries: number;
    totalHits: number;
    totalMisses: number;
    hitRate: number;
    entries?: Array<{
      key: string;
      expired: boolean;
      lastAccessed: string;
      hitCount: number;
    }>;
  } | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshStats = () => {
    // Mock stats since activityCache was removed
    const stats = {
      totalEntries: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      lastUpdate: new Date().toISOString(),
      entries: []
    };
    setCacheStats(stats);
    setRefreshCount(prev => prev + 1);
  };

  useEffect(() => {
    if (show) {
      refreshStats();
      const interval = setInterval(refreshStats, 2000); // Refresh every 2s
      return () => clearInterval(interval);
    }
  }, [show]);

  if (!show) return null;

  return (
    <Card
      title={
        <Space>
          <BugOutlined />
          <Title level={5} style={{ margin: 0 }}>
            Activity Debug Panel
          </Title>
          <Tag color="blue">Refresh: {refreshCount}</Tag>
        </Space>
      }
      extra={
        <Button 
          size="small" 
          icon={<ReloadOutlined />} 
          onClick={refreshStats}
        >
          Làm mới
        </Button>
      }
      style={{ 
        position: 'fixed', 
        top: 20, 
        right: 20, 
        width: 400, 
        zIndex: 9999,
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      <Collapse defaultActiveKey={['cache']} size="small">
        <Panel header="Cache Statistics" key="cache">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic 
                title="Cache Size" 
                value={cacheStats?.size || 0} 
                suffix="entries"
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Total Entries" 
                value={cacheStats?.entries?.length || 0} 
              />
            </Col>
          </Row>
          
          <div style={{ marginTop: 16 }}>
            <Text strong>Cache Entries:</Text>
            {cacheStats?.entries?.map((entry, index: number) => (
              <div key={index} style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <Tag color="blue">{entry.key}</Tag>
                    <Tag color={entry.expired ? 'red' : 'green'}>
                      {entry.expired ? 'Expired' : 'Valid'}
                    </Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Data: {entry.dataLength} items
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Age: {Math.round((Date.now() - entry.timestamp) / 1000)}s
                  </Text>
                </Space>
              </div>
            ))}
          </div>
        </Panel>

        <Panel header="Performance Metrics" key="performance">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>WebSocket Status:</Text>
              <Tag color="processing">Monitoring...</Tag>
            </div>
            
            <div>
              <Text strong>API Calls:</Text>
              <Text type="secondary"> Tracked via cache hits/misses</Text>
            </div>
            
            <div>
              <Text strong>Memory Usage:</Text>
              <Text type="secondary"> {JSON.stringify(cacheStats).length} bytes (approx)</Text>
            </div>
          </Space>
        </Panel>

        <Panel header="Actions" key="actions">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              size="small" 
              onClick={() => {
                console.log('Cache service đã được xóa - sử dụng Socket.IO thay thế');
                refreshStats();
              }}
              danger
            >
              Clear All Cache
            </Button>
            
            <Button 
              size="small" 
              onClick={() => {
                console.log('Cache service đã được xóa - sử dụng Socket.IO thay thế');
                refreshStats();
              }}
            >
              Invalidate Cache
            </Button>
            
            <Button 
              size="small" 
              onClick={() => {
                console.log('Activity Cache Stats:', cacheStats);
                console.log('Cache service đã được thay thế bằng Socket.IO real-time');
              }}
            >
              Log to Console
            </Button>
          </Space>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default ActivityDebug;
