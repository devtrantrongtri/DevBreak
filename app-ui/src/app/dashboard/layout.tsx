'use client';

import React from 'react';
import { PrivateLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute requiredPermissions={['dashboard.view']}>
      <PrivateLayout>{children}</PrivateLayout>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
