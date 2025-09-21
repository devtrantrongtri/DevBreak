// export interface ActivityLog {
//   id: string;
//   action: string;
//   resource: string;
//   resourceId?: string;
//   ipAddress: string;
//   userAgent?: string;
//   method?: string;
//   path?: string;
//   status: 'success' | 'error' | 'warning' | 'info';
//   details?: Record<string, any>;
//   createdAt: string;
//   user?: {
//     id: string;
//     email: string;
//     displayName: string;
//   };
// }

export interface ActivityLogFilters {
  search?: string;
  action?: string;
  resource?: string;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedActivityLogs {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityLogStats {
  totalActivities: number;
  successRate: number;
  errorCount: number;
  actionStats: Record<string, number>;
  resourceStats: Record<string, number>;
  statusStats: Record<string, number>;
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
  details?: Record<string, any> | null;
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
