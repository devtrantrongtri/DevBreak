'use client';

import React from 'react';
import { ConfigProvider, App } from 'antd';
import { AuthProvider } from '@/contexts/AuthContext';
import I18nProvider from './I18nProvider';

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <I18nProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <App>
          <AuthProvider>
            {children}
          </AuthProvider>
        </App>
      </ConfigProvider>
    </I18nProvider>
  );
};

export default AppProvider;
