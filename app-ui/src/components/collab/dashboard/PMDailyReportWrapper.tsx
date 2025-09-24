'use client';

import React from 'react';
import VisibilityWrapper from '../common/VisibilityWrapper';
import PMDailyReportDashboard from './PMDailyReportDashboard';

interface PMDailyReportWrapperProps {
  className?: string;
  projectId?: string;
  projectName?: string;
  componentKey?: string;
}

/**
 * Wrapper component for PM Daily Report Dashboard with visibility control
 * This allows PM to see the dashboard, or admin to configure it to be visible to all roles
 */
const PMDailyReportWrapper: React.FC<PMDailyReportWrapperProps> = ({
  className,
  projectId,
  projectName,
  componentKey = 'pm-daily-dashboard'
}) => {
  return (
    <VisibilityWrapper 
      componentKey={componentKey}
      fallback={null} // Hide completely if not visible
    >
      <PMDailyReportDashboard
        className={className}
        projectId={projectId}
        projectName={projectName}
      />
    </VisibilityWrapper>
  );
};

export default PMDailyReportWrapper;
