// User types
export interface CreateUserDto {
  email: string;
  displayName: string;
  password: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  displayName?: string;
  password?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  groups?: GroupResponse[];
}

// Group types
export interface CreateGroupDto {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateGroupDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface GroupResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: PermissionResponse[];
  users?: UserResponse[];
}

// Permission types
export interface CreatePermissionDto {
  code: string;
  name: string;
  description?: string;
  parentCode?: string;
}

export interface UpdatePermissionDto {
  code?: string;
  name?: string;
  description?: string;
  parentCode?: string;
}

export interface PermissionResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: PermissionResponse[];
}

// Menu types
export interface CreateMenuDto {
  name: string;
  path: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  permissionCode: string;
  parentId?: string;
}

export interface UpdateMenuDto {
  name?: string;
  path?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  permissionCode?: string;
  parentId?: string;
}

export interface MenuResponse {
  id: string;
  name: string;
  path: string;
  icon?: string;
  order: number;
  isActive: boolean;
  permissionCode: string;
  permission?: PermissionResponse;
  description?: string;
  createdAt: string;
  updatedAt: string;
  parent?: MenuResponse;
  children?: MenuResponse[];
}

// Assignment types
export interface AssignUserGroupsDto {
  groupIds: string[];
}

export interface AssignGroupPermissionsDto {
  permissionCodes: string[];
}

// Seeding types
export interface SeedResponse {
  message: string;
  details: {
    permissions: number;
    menus: number;
    groups: number;
    users: number;
  };
}
