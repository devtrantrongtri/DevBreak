'use client';

import React, { useState } from 'react';
import { Select, Space, Typography, Divider, Input, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { AVAILABLE_ICONS, ICON_CATEGORIES, IconOption } from '@/constants/icons';

const { Text } = Typography;
const { Option, OptGroup } = Select;

interface IconSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  style?: React.CSSProperties;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  value,
  onChange,
  placeholder = "Chọn icon",
  allowClear = true,
  style,
}) => {
  const [searchText, setSearchText] = useState('');

  // Group icons by category
  const groupedIcons = AVAILABLE_ICONS.reduce((acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = [];
    }
    acc[icon.category].push(icon);
    return acc;
  }, {} as Record<string, IconOption[]>);

  // Filter icons based on search text
  const filteredGroupedIcons = Object.keys(groupedIcons).reduce((acc, category) => {
    const filteredIcons = groupedIcons[category].filter(icon =>
      icon.label.toLowerCase().includes(searchText.toLowerCase()) ||
      icon.value.toLowerCase().includes(searchText.toLowerCase())
    );
    
    if (filteredIcons.length > 0) {
      acc[category] = filteredIcons;
    }
    
    return acc;
  }, {} as Record<string, IconOption[]>);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const dropdownRender = (menu: React.ReactElement) => (
    <div>
      <div style={{ padding: '8px' }}>
        <Input
          placeholder="Tìm kiếm icon..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
      <Divider style={{ margin: '4px 0' }} />
      {Object.keys(filteredGroupedIcons).length > 0 ? (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {menu}
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy icon nào"
          />
        </div>
      )}
    </div>
  );

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      style={style}
      showSearch={false} // We handle search manually
      dropdownRender={dropdownRender}
      optionLabelProp="label"
    >
      {Object.keys(filteredGroupedIcons).map(category => (
        <OptGroup key={category} label={category}>
          {filteredGroupedIcons[category].map(icon => (
            <Option 
              key={icon.value} 
              value={icon.value}
              label={
                <Space>
                  {icon.icon}
                  <Text>{icon.label}</Text>
                </Space>
              }
            >
              <Space>
                {icon.icon}
                <Text>{icon.label}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {icon.value}
                </Text>
              </Space>
            </Option>
          ))}
        </OptGroup>
      ))}
    </Select>
  );
};

export default IconSelector;
