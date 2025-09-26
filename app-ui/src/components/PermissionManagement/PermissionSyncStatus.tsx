'use client';

import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Alert,
  Statistic,
  Row,
  Col,
  Modal,
  List,
  Tag,
  message,
  Spin
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface SyncResult {
  created: string[];
  updated: string[];
  discovered: number;
  existing: number;
}

interface DiscoveredPermission {
  code: string;
  name: string;
  description: string;
  source: string;
  module: string;
}

interface PermissionSyncStatusProps {
  onSync: () => Promise<SyncResult>;
  onDiscover: () => Promise<DiscoveredPermission[]>;
  lastSyncTime?: Date;
  className?: string;
}

const PermissionSyncStatus: React.FC<PermissionSyncStatusProps> = ({
  onSync,
  onDiscover,
  lastSyncTime,
  className
}) => {
  const [syncing, setSyncing] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [discoveredPermissions, setDiscoveredPermissions] = useState<DiscoveredPermission[]>([]);
  const [showDiscoveredModal, setShowDiscoveredModal] = useState(false);
  const [showSyncResultModal, setShowSyncResultModal] = useState(false);

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const result = await onDiscover();
      setDiscoveredPermissions(result);
      setShowDiscoveredModal(true);
      message.success(`Phát hiện ${result.length} quyền từ code`);
    } catch (error) {
      message.error('Phát hiện quyền thất bại');
    } finally {
      setDiscovering(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await onSync();
      setSyncResult(result);
      setShowSyncResultModal(true);
      
      if (result.created.length > 0 || result.updated.length > 0) {
        message.success(`Đồng bộ thành công! Tạo mới: ${result.created.length}, Cập nhật: ${result.updated.length}`);
      } else {
        message.info('Không có quyền nào cần đồng bộ');
      }
    } catch (error) {
      message.error('Đồng bộ quyền thất bại');
    } finally {
      setSyncing(false);
    }
  };

  const getSyncStatusColor = () => {
    if (!lastSyncTime) return 'orange';
    const hoursSinceSync = (Date.now() - lastSyncTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 24 ? 'orange' : 'green';
  };

  const getSyncStatusText = () => {
    if (!lastSyncTime) return 'Chưa đồng bộ';
    const hoursSinceSync = (Date.now() - lastSyncTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceSync < 1) return 'Vừa đồng bộ';
    if (hoursSinceSync < 24) return `${Math.floor(hoursSinceSync)} giờ trước`;
    return `${Math.floor(hoursSinceSync / 24)} ngày trước`;
  };

  return (
    <>
      <Card 
        size="small" 
        className={className}
        style={{ borderRadius: 6, marginBottom: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
              <ThunderboltOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              Auto-Discovery System
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Tự động phát hiện và đồng bộ quyền từ code
            </Text>
          </div>
          
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={handleDiscover}
              loading={discovering}
              style={{ borderRadius: 4 }}
            >
              Phát hiện
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<SyncOutlined />}
              onClick={handleSync}
              loading={syncing}
              style={{ borderRadius: 4 }}
            >
              Đồng bộ
            </Button>
          </Space>
        </div>

        {lastSyncTime && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircleOutlined style={{ color: getSyncStatusColor() }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Lần cuối: {getSyncStatusText()}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {lastSyncTime.toLocaleString('vi-VN')}
                </Text>
              </Col>
            </Row>
          </div>
        )}

        {!lastSyncTime && (
          <Alert
            message="Chưa đồng bộ quyền"
            description="Hệ thống chưa được đồng bộ quyền từ code. Nhấn 'Đồng bộ' để bắt đầu."
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
      </Card>

      {/* Discovered Permissions Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Quyền được phát hiện từ code
          </Space>
        }
        open={showDiscoveredModal}
        onCancel={() => setShowDiscoveredModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowDiscoveredModal(false)}>
            Đóng
          </Button>,
          <Button
            key="sync"
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => {
              setShowDiscoveredModal(false);
              handleSync();
            }}
          >
            Đồng bộ ngay
          </Button>
        ]}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Statistic
            title="Tổng số quyền phát hiện"
            value={discoveredPermissions.length}
            prefix={<InfoCircleOutlined />}
          />
        </div>
        
        <List
          size="small"
          dataSource={discoveredPermissions}
          renderItem={(permission) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{permission.name}</Text>
                    <Tag color="blue">{permission.code}</Tag>
                    <Tag color="green">{permission.module}</Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {permission.description}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Nguồn: {permission.source}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
          style={{ maxHeight: 400, overflow: 'auto' }}
        />
      </Modal>

      {/* Sync Result Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            Kết quả đồng bộ
          </Space>
        }
        open={showSyncResultModal}
        onCancel={() => setShowSyncResultModal(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowSyncResultModal(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {syncResult && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic
                  title="Phát hiện"
                  value={syncResult.discovered}
                  prefix={<EyeOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Đã tồn tại"
                  value={syncResult.existing}
                  prefix={<InfoCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Tạo mới"
                  value={syncResult.created.length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Cập nhật"
                  value={syncResult.updated.length}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>

            {syncResult.created.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>Quyền được tạo mới:</Title>
                <div style={{ maxHeight: 150, overflow: 'auto' }}>
                  {syncResult.created.map(code => (
                    <Tag key={code} color="green" style={{ margin: 2 }}>
                      {code}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {syncResult.updated.length > 0 && (
              <div>
                <Title level={5}>Quyền được cập nhật:</Title>
                <div style={{ maxHeight: 150, overflow: 'auto' }}>
                  {syncResult.updated.map(code => (
                    <Tag key={code} color="blue" style={{ margin: 2 }}>
                      {code}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {syncResult.created.length === 0 && syncResult.updated.length === 0 && (
              <Alert
                message="Không có thay đổi"
                description="Tất cả quyền đã được đồng bộ và cập nhật."
                type="info"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default PermissionSyncStatus;
