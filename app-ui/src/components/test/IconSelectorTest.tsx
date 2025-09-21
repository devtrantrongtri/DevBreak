'use client';

import React, { useState } from 'react';
import { Card, Space, Typography } from 'antd';
import IconSelector from '@/components/common/IconSelector';
import { getIconByName } from '@/constants/icons';

const { Title, Text } = Typography;

const IconSelectorTest: React.FC = () => {
  const [selectedIcon, setSelectedIcon] = useState<string>('');

  return (
    <Card title="Icon Selector Test" style={{ margin: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Chọn Icon:</Title>
          <IconSelector
            value={selectedIcon}
            onChange={(value) => setSelectedIcon(value)}
            placeholder="Chọn một icon"
            style={{ width: '300px' }}
          />
        </div>
        
        {selectedIcon && (
          <div>
            <Title level={4}>Icon đã chọn:</Title>
            <Space>
              {getIconByName(selectedIcon)}
              <Text strong>{selectedIcon}</Text>
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default IconSelectorTest;
