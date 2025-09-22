'use client';

import React, { useState } from 'react';
import {
  Empty,
  Button,
  Typography,
  Space,
  Card
} from 'antd';
import { ProjectOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import CreateProjectModal from './CreateProjectModal';
import PermissionBasedComponent from '../common/PermissionBasedComponent';

const { Title, Text } = Typography;

const EmptyProjectState: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        padding: '40px 20px'
      }}>
        <Card
          style={{
            maxWidth: 600,
            width: '100%',
            textAlign: 'center',
            border: '2px dashed #d9d9d9',
            backgroundColor: '#fafafa'
          }}
          styles={{ body: { padding: '40px 24px' } }}
        >
          <Empty
            image={<ProjectOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
            styles={{ image: { marginBottom: 24 } }}
            description={
              <Space direction="vertical" size={16}>
                <Title level={3} style={{ margin: 0, color: '#595959' }}>
                  Chưa có dự án nào
                </Title>
                <Text type="secondary" style={{ fontSize: '16px', lineHeight: 1.6 }}>
                  Bắt đầu bằng cách tạo dự án đầu tiên của bạn.<br />
                  Quản lý daily reports, tasks và team collaboration tại một nơi.
                </Text>
              </Space>
            }
          >
            <Space direction="vertical" size={16} style={{ marginTop: 24 }}>
              <PermissionBasedComponent requiredPermissions={['collab.projects.create']}>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                  style={{
                    height: 48,
                    fontSize: '16px',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)'
                  }}
                >
                  Tạo dự án mới
                </Button>
              </PermissionBasedComponent>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 32,
                marginTop: 32,
                padding: '24px 0',
                borderTop: '1px solid #f0f0f0'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <ProjectOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                  <div>
                    <Text strong>Quản lý dự án</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Tổ chức công việc theo dự án
                    </Text>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <TeamOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                  <div>
                    <Text strong>Team Collaboration</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Daily reports & task tracking
                    </Text>
                  </div>
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#e6f7ff', 
                padding: 16, 
                borderRadius: 8,
                marginTop: 16
              }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  💡 <strong>Gợi ý:</strong> Nếu bạn không thể tạo dự án, hãy liên hệ với PM hoặc Admin 
                  để được mời tham gia dự án hiện có.
                </Text>
              </div>
            </Space>
          </Empty>
        </Card>
      </div>

      <CreateProjectModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={() => {
          // Modal will auto close and refresh projects
        }}
      />
    </>
  );
};

export default EmptyProjectState;
