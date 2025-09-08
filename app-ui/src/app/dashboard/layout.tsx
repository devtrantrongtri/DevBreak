'use client';

import React from 'react';
import { PrivateLayout } from '@/components/layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return <PrivateLayout>{children}</PrivateLayout>;
};

export default DashboardLayout;
