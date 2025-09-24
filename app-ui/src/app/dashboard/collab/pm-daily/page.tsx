'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import CollabLayout from '@/components/collab/layout/CollabLayout';
import { PMDailyReportWrapper } from '@/components/collab/dashboard';

const PMDailyPage: React.FC = () => {
  return (
    <ProtectedRoute requiredPermissions={['collab.projects.view']}>
      <CollabLayout
        title="PM Daily Dashboard"
        breadcrumb={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Collab Hub', href: '/dashboard/collab' },
          { title: 'PM Daily Dashboard' }
        ]}
      >
        <PMDailyReportWrapper componentKey="pm-daily-dashboard" />
      </CollabLayout>
    </ProtectedRoute>
  );
};

export default PMDailyPage;
