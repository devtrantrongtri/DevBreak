export interface User {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  order: number;
  permissionCode: string;
  children?: MenuItem[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  effectivePermissions: string[];
}

export interface MeResponse {
  user: User;
  effectivePermissions: string[];
  menuTree: MenuItem[];
}

export interface LoginRequest {
  email: string;
  password: string;
}
