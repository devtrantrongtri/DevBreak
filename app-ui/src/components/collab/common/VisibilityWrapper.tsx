'use client';

import React from 'react';
import { useComponentVisibility } from '@/hooks/useComponentVisibility';

interface VisibilityWrapperProps {
  children: React.ReactNode;
  componentKey: string;
  fallback?: React.ReactNode;
}

/**
 * Simple wrapper that hides/shows components based on visibility settings
 * No warning messages - just hide if not visible
 */
const VisibilityWrapper: React.FC<VisibilityWrapperProps> = ({
  children,
  componentKey,
  fallback = null
}) => {
  const { isVisible, loading } = useComponentVisibility(componentKey);

  // Show loading state briefly
  if (loading) {
    return <div style={{ minHeight: '20px' }} />;
  }

  // If not visible, return fallback or null (hide completely)
  if (!isVisible) {
    return fallback as React.ReactElement;
  }

  // If visible, render children
  return <>{children}</>;
};

export default VisibilityWrapper;
