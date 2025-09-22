'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, MenuItem } from '@/types/auth';
import { apiClient } from '@/lib/api';
import { message, App } from 'antd';

interface AuthContextType {
  user: User | null;
  permissions: string[];
  menuTree: MenuItem[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  getToken: () => string | null;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { message: messageApi } = App.useApp();

  const isAuthenticated = !!user;

  // Check if user has a specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user || !permissions) return false;
    return permissions.includes(permission);
  }, [user, permissions]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login({ email, password });
      
      apiClient.setToken(response.accessToken);
      setUser(response.user);
      setPermissions(response.effectivePermissions);
      
      // Get menu tree after login
      await refreshUserData();
      
      message.success('Login successful!');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    setPermissions([]);
    setMenuTree([]);
    messageApi.info('Đăng xuất thành công');
  };

  const getToken = (): string | null => {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  };

  const refreshUserData = useCallback(async () => {
    try {
      const meResponse = await apiClient.getMe();
      setUser(meResponse.user);
      setPermissions(meResponse.effectivePermissions);
      setMenuTree(meResponse.menuTree);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, user might need to login again
      logout();
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      if (token) {
        apiClient.setToken(token);
        try {
          await refreshUserData();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          logout();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [refreshUserData]);

  const value: AuthContextType = {
    user,
    permissions,
    menuTree,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUserData,
    getToken,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
