import React from 'react';
import { Card, Row, Col, Input, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

interface PermissionSearchProps {
  searchText: string;
  onSearch: (value: string) => void;
  totalCount: number;
}

const PermissionSearch: React.FC<PermissionSearchProps> = ({
  searchText,
  onSearch,
  totalCount,
}) => {
  return (
    <Card size="small" style={{ marginBottom: 12, borderRadius: 6 }} bodyStyle={{ padding: '12px' }}>
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Tìm kiếm quyền theo mã, tên hoặc mô tả..."
            allowClear
            value={searchText}
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: '100%' }}
            size="small"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={16}>
          <Space style={{ float: 'right' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Tổng: {totalCount} quyền
            </Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default PermissionSearch;
