import { AuthResponse, MeResponse, LoginRequest } from '@/types/auth';
import {
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  AssignUserGroupsDto,
  GroupResponse,
  CreateGroupDto,
  UpdateGroupDto,
  AssignGroupPermissionsDto,
  PermissionResponse,
  MenuResponse,
  SeedResponse,
} from '@/types/api';
import { PaginatedActivityLogs } from '@/types/activity-logs';
import { Project } from '@/types/collab';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Try to get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { data?: any } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Handle data field
    const { data, ...fetchOptions } = options;
    if (data && !fetchOptions.body) {
      fetchOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    const text = await response.text();
    if (!text.trim()) {
      return {} as T;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn('Failed to parse JSON response:', text);
      return {} as T;
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe(): Promise<MeResponse> {
    return this.request<MeResponse>('/auth/me');
  }

  async getMyMenus(): Promise<MenuResponse[]> {
    return this.request<MenuResponse[]>('/auth/menus/me');
  }

  // Users endpoints
  async getUsers(): Promise<UserResponse[]> {
    return this.request<UserResponse[]>('/users');
  }

  async getUser(id: string): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/${id}`);
  }

  async createUser(userData: CreateUserDto): Promise<UserResponse> {
    return this.request<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async assignUserGroups(userId: string, groupIds: string[]): Promise<UserResponse> {
    const payload: AssignUserGroupsDto = { groupIds };
    return this.request<UserResponse>(`/users/${userId}/groups`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Groups endpoints
  async getGroups(): Promise<GroupResponse[]> {
    return this.request<GroupResponse[]>('/groups');
  }

  async createGroup(groupData: CreateGroupDto): Promise<GroupResponse> {
    return this.request<GroupResponse>('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(id: string, groupData: UpdateGroupDto): Promise<GroupResponse> {
    return this.request<GroupResponse>(`/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(groupData),
    });
  }

  async deleteGroup(id: string): Promise<void> {
    return this.request<void>(`/groups/${id}`, {
      method: 'DELETE',
    });
  }

  async assignGroupPermissions(groupId: string, permissionCodes: string[]): Promise<GroupResponse> {
    const payload: AssignGroupPermissionsDto = { permissionCodes };
    return this.request<GroupResponse>(`/groups/${groupId}/permissions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Permissions endpoints
  async getPermissions(): Promise<PermissionResponse[]> {
    return this.request<PermissionResponse[]>('/permissions');
  }

  async getPermissionTree(): Promise<PermissionResponse[]> {
    return this.request<PermissionResponse[]>('/permissions/tree');
  }

  // Menus endpoints
  async getMenus(): Promise<MenuResponse[]> {
    return this.request<MenuResponse[]>('/menus');
  }

  async getMenuTree(): Promise<MenuResponse[]> {
    return this.request<MenuResponse[]>('/menus/tree');
  }

  async updateMenuName(id: string, name: string): Promise<MenuResponse> {
    return this.request<MenuResponse>(`/menus/${id}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  async rebindMenuPermission(id: string, permissionCode: string): Promise<MenuResponse> {
    return this.request<MenuResponse>(`/menus/${id}/permission`, {
      method: 'PATCH',
      body: JSON.stringify({ permissionCode }),
    });
  }

  async updateMenu(id: string, menuData: {
    name: string;
    path: string;
    icon?: string;
    description?: string;
    permissionCode: string;
    order: number;
    isActive: boolean;
  }): Promise<MenuResponse> {
    return this.request<MenuResponse>(`/menus/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(menuData),
    });
  }

  async createMenu(menuData: {
    name: string;
    path: string;
    icon?: string;
    description?: string;
    parentId?: string | null;
    permissionCode: string;
    order: number;
    isActive: boolean;
  }): Promise<any> {
    return this.request('/menus', {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
  }

  async deleteMenu(id: string): Promise<any> {
    return this.request(`/menus/${id}`, {
      method: 'DELETE',
    });
  }

  async createPermission(permissionData: {
    code: string;
    name: string;
    description?: string;
    parentCode?: string | null;
    isActive: boolean;
  }): Promise<any> {
    return this.request('/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  }

  async updatePermission(id: string, permissionData: {
    name: string;
    description?: string;
    parentCode?: string | null;
    isActive: boolean;
  }): Promise<any> {
    return this.request(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  }

  async deletePermission(id: string): Promise<any> {
    return this.request(`/permissions/${id}`, {
      method: 'DELETE',
    });
  }

  // Permission sync endpoints
  async post(url: string): Promise<any> {
    return this.request(url, {
      method: 'POST',
    });
  }

  async get(url: string): Promise<any> {
    return this.request(url, {
      method: 'GET',
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<any> {
    return this.request('/dashboard/stats');
  }

  async getUserGrowthData(months: number = 6): Promise<any[]> {
    return this.request(`/dashboard/user-growth?months=${months}`);
  }

  async getActivityTrends(days: number = 7): Promise<any[]> {
    return this.request(`/dashboard/activity-trends?days=${days}`);
  }

  async getQuickStats(): Promise<any> {
    return this.request('/dashboard/quick-stats');
  }

  // Activity Logs endpoints
  async getActivityLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedActivityLogs> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request(`/activity-logs${queryString ? `?${queryString}` : ''}`);
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    return this.request(`/activity-logs/recent?limit=${limit}`);
  }

  async getUserActivityLogs(userId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request(`/activity-logs/user/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  async getMyActivities(params?: {
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request(`/activity-logs/my-activities${queryString ? `?${queryString}` : ''}`);
  }

  // Seeding
  async seedDatabase(): Promise<SeedResponse> {
    return this.request<SeedResponse>('/seed', {
      method: 'POST',
    });
  }

  // Admin Projects API
  async getAllProjectsForAdmin(): Promise<Project[]> {
    return this.request<Project[]>('/collab/projects/admin/all');
  }

  // Component Visibility API
  async addComponentToProject(projectId: string, componentData: {
    componentKey: string;
    displayName: string;
    description?: string;
    defaultRoles?: string[];
  }): Promise<any> {
    return this.request(`/collab/projects/${projectId}/components`, {
      method: 'POST',
      data: componentData
    });
  }

  async getAvailableComponents(): Promise<{ key: string; name: string; description?: string }[]> {
    return this.request('/collab/projects/components/available');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
