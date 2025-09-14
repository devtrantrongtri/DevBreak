'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Result, Button } from 'antd';
import PageLoading from './PageLoading';

interface PageWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  loadingType?: 'spin' | 'skeleton' | 'card';
  title?: string;
  fallback?: React.ReactNode;
}

const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary
}) => (
  <Result
    status="error"
    title="Something went wrong"
    subTitle={error.message}
    extra={
      <Button type="primary" onClick={resetErrorBoundary}>
        Try Again
      </Button>
    }
  />
);

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  loading = false,
  loadingType = 'spin',
  title = 'Loading...',
  fallback
}) => {
  if (loading) {
    return fallback || <PageLoading type={loadingType} title={title} />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<PageLoading type={loadingType} title={title} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default PageWrapper;
