'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import CollabLayout from '@/components/collab/layout/CollabLayout';
import CollabDashboard from '@/components/collab/dashboard/CollabDashboard';

const CollabPage: React.FC = () => {
  return (
    <ProtectedRoute requiredPermissions={['collab.projects.view']}>
      <CollabLayout
        title="Collab Hub"
        breadcrumb={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Collab Hub' }
        ]}
      >
        <CollabDashboard />
      </CollabLayout>
    </ProtectedRoute>
  );
};

export default CollabPage;
