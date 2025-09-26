'use client';

import { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Row, 
  Col,
  Typography 
} from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

interface FilterValues {
  search?: string;
  action?: string;
  resource?: string;
  status?: string;
  userId?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
}

interface FilterObject {
  search?: string;
  action?: string;
  userId?: string;
  dateRange?: [string, string];
  [key: string]: unknown;
}

interface ActivityLogFiltersProps {
  onFilter: (filters: FilterObject) => void;
  loading?: boolean;
  showUserFilter?: boolean;
}

const ActivityLogFilters: React.FC<ActivityLogFiltersProps> = ({
  onFilter,
  loading = false,
  showUserFilter = true,
}) => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(true);

  const handleFilter = (values: FilterValues) => {
    const filters: FilterObject = {};
    
    if (values.search) {
      filters.search = values.search;
    }
    
    if (values.action) {
      filters.action = values.action;
    }
    
    if (values.resource) {
      filters.resource = values.resource;
    }
    
    if (values.status) {
      filters.status = values.status;
    }
    
    if (values.userId) {
      filters.userId = values.userId;
    }
    
    if (values.dateRange && values.dateRange.length === 2) {
      filters.startDate = values.dateRange[0].startOf('day').toISOString();
      filters.endDate = values.dateRange[1].endOf('day').toISOString();
    }
    
    onFilter(filters);
  };

  const handleReset = () => {
    form.resetFields();
    onFilter({});
  };

  const actionOptions = [
    { label: 'View', value: 'view' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' },
    { label: 'Login', value: 'login' },
    { label: 'Logout', value: 'logout' },
  ];

  const resourceOptions = [
    { label: 'Users', value: 'users' },
    { label: 'Groups', value: 'groups' },
    { label: 'Permissions', value: 'permissions' },
    { label: 'Menus', value: 'menus' },
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Authentication', value: 'authentication' },
  ];

  const statusOptions = [
    { label: 'Success', value: 'success' },
    { label: 'Error', value: 'error' },
    { label: 'Warning', value: 'warning' },
    { label: 'Info', value: 'info' },
  ];

  return (
    <Card 
      size="small" 
      style={{ marginBottom: 16 }}
      title={
        <Space>
          <Text strong>Filters</Text>
          <Button 
            type="link" 
            size="small"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Show More' : 'Show Less'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFilter}
        initialValues={{}}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="search" label="Search">
              <Input
                placeholder="Search in details..."
                allowClear
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="action" label="Action">
              <Select placeholder="Select action" allowClear>
                {actionOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="resource" label="Resource">
              <Select placeholder="Select resource" allowClear>
                {resourceOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="status" label="Status">
              <Select placeholder="Select status" allowClear>
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {!collapsed && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="dateRange" label="Date Range">
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Start Date', 'End Date']}
                />
              </Form.Item>
            </Col>
            
            {showUserFilter && (
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="userId" label="User ID">
                  <Input
                    placeholder="Enter user ID"
                    allowClear
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        )}

        <Row>
          <Col>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
                loading={loading}
              >
                Filter
              </Button>
              <Button 
                onClick={handleReset}
                icon={<ClearOutlined />}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default ActivityLogFilters;
