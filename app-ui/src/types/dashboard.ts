export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  totalPermissions: number;
  newUsersToday: number;
  loginsTodayCount: number;
  mostActiveGroup: {
    name: string;
    userCount: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    lastBackup?: Date;
    memoryUsage?: number;
    diskUsage?: number;
  };
  totalActivitiesToday?: number;
  averageSessionDuration?: number;
}

export interface GrowthData {
  month: string;
  year: number;
  newUsers: number;
  newGroups: number;
  totalUsers: number;
  totalGroups: number;
  monthName: string;
}

export interface ActivityTrend {
  date: string;
  logins: number;
  userCreations: number;
  userUpdates: number;
  groupOperations: number;
  totalActivities: number;
  dayName: string;
}

export interface ActivityLog {
  id: string;
  user?: {
    id: string;
    displayName: string;
    email: string;
  } | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress: string;
  userAgent?: string | null;
  method?: string | null;
  path?: string | null;
  status: string;
  createdAt: Date;
}

export interface PaginatedActivityLogs {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
