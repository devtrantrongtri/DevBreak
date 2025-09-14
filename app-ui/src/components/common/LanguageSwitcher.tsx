'use client';

import React from 'react';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  return (
    <Space>
      <GlobalOutlined />
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        style={{ width: 120 }}
        size="small"
      >
        {languages.map(lang => (
          <Option key={lang.code} value={lang.code}>
            <Space>
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </Space>
          </Option>
        ))}
      </Select>
    </Space>
  );
};

export default LanguageSwitcher;
