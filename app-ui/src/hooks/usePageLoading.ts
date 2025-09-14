'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook để quản lý loading state khi chuyển trang
 * Tích hợp với NextJS TopLoader để có UX tốt hơn
 */
export const usePageLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const navigateWithLoading = (url: string) => {
    setIsLoading(true);
    router.push(url);
    // Reset loading state sau một khoảng thời gian ngắn
    setTimeout(() => setIsLoading(false), 100);
  };

  const navigateBack = () => {
    setIsLoading(true);
    router.back();
    setTimeout(() => setIsLoading(false), 100);
  };

  const refresh = () => {
    setIsLoading(true);
    router.refresh();
    setTimeout(() => setIsLoading(false), 100);
  };

  return {
    isLoading,
    navigateWithLoading,
    navigateBack,
    refresh,
    setIsLoading,
  };
};

/**
 * Hook để tạo loading state cho API calls
 */
export const useApiLoading = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWithLoading = async <T>(
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred';
      setError(errorMessage);
      onError?.(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    executeWithLoading,
    clearError,
    setLoading,
  };
};
