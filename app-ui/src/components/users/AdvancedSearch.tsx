'use client';

import React, { useState } from 'react';
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
  Collapse,
  Tag,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { GroupResponse } from '@/types/api';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { Text } = Typography;

interface AdvancedSearchProps {
  groups: GroupResponse[];
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

export interface SearchFilters {
  searchText?: string;
  status?: string;
  groups?: string[];
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  createdDateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  groups,
  onSearch,
  onClear,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { t } = useTranslation();

  const handleSearch = (values: {
    searchText?: string;
    status?: string;
    groups?: string[];
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
    createdDateRange?: [dayjs.Dayjs, dayjs.Dayjs];
    roles?: string[];
  }) => {
    const filters: SearchFilters = {
      searchText: values.searchText?.trim(),
      status: values.status,
      groups: values.groups,
      dateRange: values.dateRange || null,
      createdDateRange: values.createdDateRange || null,
    };

    // Track active filters for display
    const active: string[] = [];
    if (filters.searchText) active.push('text');
    if (filters.status && filters.status !== 'all') active.push('status');
    if (filters.groups?.length) active.push('groups');
    if (filters.dateRange) active.push('dateRange');
    if (filters.createdDateRange) active.push('createdDateRange');
    
    setActiveFilters(active);
    onSearch(filters);
  };

  const handleClear = () => {
    form.resetFields();
    setActiveFilters([]);
    onClear();
  };

  const getFilterTag = (key: string, value: unknown) => {
    switch (key) {
      case 'text':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)}>
          Tìm kiếm: &quot;{String(value)}&quot;
        </Tag>;
      case 'status':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)} color="blue">
          Trạng thái: {String(value) === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>;
      case 'groups':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)} color="green">
          Nhóm: {Array.isArray(value) ? value.length : 0} nhóm đã chọn
        </Tag>;
      case 'dateRange':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)} color="orange">
          Cập nhật: {Array.isArray(value) && value[0]?.format ? `${value[0].format('DD/MM/YYYY')} - ${value[1].format('DD/MM/YYYY')}` : 'Không xác định'}
        </Tag>;
      case 'createdDateRange':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)} color="purple">
          Tạo: {Array.isArray(value) && value[0]?.format ? `${value[0].format('DD/MM/YYYY')} - ${value[1].format('DD/MM/YYYY')}` : 'Không xác định'}
        </Tag>;
      default:
        return null;
    }
  };

  const handleRemoveFilter = (filterKey: string) => {
    const values = form.getFieldsValue();
    switch (filterKey) {
      case 'text':
        values.searchText = undefined;
        break;
      case 'status':
        values.status = 'all';
        break;
      case 'groups':
        values.groups = undefined;
        break;
      case 'dateRange':
        values.dateRange = undefined;
        break;
      case 'createdDateRange':
        values.createdDateRange = undefined;
        break;
    }
    form.setFieldsValue(values);
    handleSearch(values);
  };

  return (
    <Card size="small" style={{ marginBottom: 8, padding: 0 }} bodyStyle={{ padding: '8px 12px' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        initialValues={{
          status: 'all',
        }}
      >
        {/* Basic Search */}
        <Row gutter={[8, 8]} align="bottom">
          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="searchText" >
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tìm theo email, tên hiển thị..."
                allowClear
                size="small"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6} lg={4}>
            <Form.Item name="status" >
              <Select size="small">
                <Option value="all">Tất cả</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={3} lg={2}>
            <Form.Item >
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SearchOutlined />}
                  loading={loading}
                  size="small"
                >
                  Tìm kiếm
                </Button>
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={handleClear}
                  size="small"
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>

        {/* Advanced Filters */}
        <Collapse ghost style={{ marginTop: -16 }}>
          <Panel 
            style={{ padding: 0 }}
            header={
              <Space>
                <FilterOutlined />
                <Text>Bộ lọc nâng cao</Text>
                {activeFilters.length > 0 && (
                  <Tag color="blue">
                    {activeFilters.length} bộ lọc
                  </Tag>
                )}
              </Space>
            } 
            key="advanced"
          >
            <Row gutter={[8, 0]}>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item name="groups" label="Nhóm quyền" style={{ marginBottom: 8 }}>
                  <Select
                    mode="multiple"
                    placeholder="Chọn nhóm quyền"
                    allowClear
                    showSearch
                    size="small"
                    filterOption={(input, option) => {
                      const children = option?.children as any;
                      if (typeof children === 'string') {
                        return children.toLowerCase().includes(input.toLowerCase());
                      }
                      // Handle complex children (like Space component with text)
                      if (children?.props?.children) {
                        const textContent = Array.isArray(children.props.children)
                          ? children.props.children.find((child: any) => typeof child === 'string')
                          : children.props.children;
                        return typeof textContent === 'string' && textContent.toLowerCase().includes(input.toLowerCase());
                      }
                      return false;
                    }}
                  >
                    {groups.map(group => (
                      <Option key={group.id} value={group.id}>
                        <Space>
                          <TeamOutlined />
                          {group.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item name="createdDateRange" label="Ngày tạo" style={{ marginBottom: 8 }}>
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['Từ ngày', 'Đến ngày']}
                    format="DD/MM/YYYY"
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item name="dateRange" label="Ngày cập nhật" style={{ marginBottom: 8 }}>
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['Từ ngày', 'Đến ngày']}
                    format="DD/MM/YYYY"
                    size="small"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Form>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div style={{ marginTop: 0, paddingTop: 2, borderTop: '1px solid #f0f0f0' }}>
          <Space wrap>
            <Text type="secondary">Bộ lọc đang áp dụng:</Text>
            {activeFilters.map(filterKey => {
              const values = form.getFieldsValue();
              const value = values[filterKey];
              return getFilterTag(filterKey, value);
            })}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default AdvancedSearch;
