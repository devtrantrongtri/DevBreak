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

  const handleSearch = (values: any) => {
    const filters: SearchFilters = {
      searchText: values.searchText?.trim(),
      status: values.status,
      groups: values.groups,
      dateRange: values.dateRange,
      createdDateRange: values.createdDateRange,
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

  const getFilterTag = (key: string, value: any) => {
    switch (key) {
      case 'text':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)}>
          Tìm kiếm: "{value}"
        </Tag>;
      case 'status':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)} color="blue">
          Trạng thái: {value === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>;
      case 'groups':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)} color="green">
          Nhóm: {value.length} nhóm đã chọn
        </Tag>;
      case 'dateRange':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)} color="orange">
          Cập nhật: {value[0].format('DD/MM/YYYY')} - {value[1].format('DD/MM/YYYY')}
        </Tag>;
      case 'createdDateRange':
        return <Tag key={key} closable onClose={() => handleRemoveFilter(key)} color="purple">
          Tạo: {value[0].format('DD/MM/YYYY')} - {value[1].format('DD/MM/YYYY')}
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
    <Card size="small" style={{ marginBottom: 16 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        initialValues={{
          status: 'all',
        }}
      >
        {/* Basic Search */}
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="searchText" label="Tìm kiếm">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tìm theo email, tên hiển thị..."
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6} lg={4}>
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Option value="all">Tất cả</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6} lg={4}>
            <Form.Item label=" ">
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  Tìm kiếm
                </Button>
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={handleClear}
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>

        {/* Advanced Filters */}
        <Collapse ghost>
          <Panel 
            header={
              <Space>
                <FilterOutlined />
                <Text>Bộ lọc nâng cao</Text>
                {activeFilters.length > 0 && (
                  <Tag color="blue" size="small">
                    {activeFilters.length} bộ lọc
                  </Tag>
                )}
              </Space>
            } 
            key="advanced"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item name="groups" label="Nhóm quyền">
                  <Select
                    mode="multiple"
                    placeholder="Chọn nhóm quyền"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                    }
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
                <Form.Item name="createdDateRange" label="Ngày tạo">
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['Từ ngày', 'Đến ngày']}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item name="dateRange" label="Ngày cập nhật">
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['Từ ngày', 'Đến ngày']}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Form>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
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
