# Permission System Module

## Overview

The Permission System is a core module that implements Role-Based Access Control (RBAC) for the application. It manages permissions, their hierarchical relationships, and how they're assigned to users through groups.

## Core Concepts

### Permission Structure

Permissions follow a hierarchical structure with a naming convention of `resource.action`:

- **Resource**: The entity or area being accessed (e.g., `system`, `user`, `menu`)
- **Action**: The operation being performed (e.g., `manage`, `create`, `update`, `delete`)

Example: `system.users.manage` grants access to the user management functionality.

### Permission Hierarchy

Permissions follow a parent-child relationship:

1. A child permission is only effective if all its ancestor permissions are present
2. Example: `system.users.manage` requires the parent permission `system.manage`

### Effective Permissions

A user's effective permissions are calculated as:

1. Union of all permissions from all groups the user belongs to
2. Filtered by the parent-child rule (removing "orphaned" permissions)

## Components

### 1. AddPermissionModal Component

Located at `app-ui/src/components/PermissionManagement/AddPermissionModal.tsx`

Modal for creating new permissions with:
- Form fields for code, name, description
- Parent permission selection
- Active status toggle

### 2. EditPermissionModal Component

Located at `app-ui/src/components/PermissionManagement/EditPermissionModal.tsx`

Modal for updating permissions with:
- Pre-filled form with current permission data
- Disabled permission code field (codes are immutable)
- Parent permission selection
- Active status toggle

### 3. DeletePermissionModal Component

Located at `app-ui/src/components/PermissionManagement/DeletePermissionModal.tsx`

Confirmation modal for deleting permissions:
- Displays permission details before deletion
- Warning about the impact of deletion on users, groups, and child permissions
- Confirmation required to proceed

## API Integration

The Permission System interacts with the following API endpoints:

- `GET /permissions`: Retrieve all permissions
- `POST /permissions`: Create a new permission
- `PATCH /permissions/:code`: Update a permission
- `DELETE /permissions/:code`: Delete a permission
- `GET /permissions/me`: Get effective permissions for the current user

## Usage Guidelines

### Creating Permissions

When creating a new permission:

1. Follow the `resource.action` naming convention
2. Provide a clear, descriptive name
3. Select an appropriate parent permission if it's a child permission
4. Consider the implications on menu visibility if the permission is linked to a menu

### Permission Assignment

Permissions are assigned to groups, not directly to users:

1. Users inherit permissions from the groups they belong to
2. When assigning permissions to a group, the UI automatically handles parent-child relationships
3. Checking a parent permission automatically checks all its children
4. Unchecking a parent permission automatically unchecks all its children

### Permission Checks

In the frontend code, use the AuthContext to check permissions:

```typescript
const { permissions } = useAuth();
const canCreateUser = permissions.includes('user.create');

// Conditional rendering based on permissions
{canCreateUser && <Button>Create User</Button>}
```

## Default Permissions

The system includes these essential permissions:

1. **Navigation Permissions** (linked to menus):
   - `dashboard.view` - Dashboard access
   - `system.manage` - System management parent menu
   - `system.users.manage` - User management
   - `system.groups.manage` - Group management
   - `system.menus.manage` - Menu management
   - `system.permissions.manage` - Permission management

2. **Action Permissions**:
   - User actions: `user.create`, `user.update`, `user.delete`
   - Group actions: `group.create`, `group.update`, `group.delete`, `group.assignPermissions`
   - Menu actions: `menu.updateName`, `menu.rebindPermission`
   - Permission actions: `permission.create`, `permission.update`, `permission.delete`

## Troubleshooting

### Common Issues

1. **Missing menu items**: Check if the user has permissions for both the menu and all its parent menus
2. **Unexpected 403 errors**: Verify that the user has all required permissions, including parent permissions
3. **Permission not taking effect**: Remember that permissions require cache refresh; changes may take up to 1 minute to propagate

### Best Practices

1. **Group Organization**: Create logical groups based on roles or departments
2. **Permission Review**: Regularly audit permission assignments to ensure principle of least privilege
3. **Testing**: Use the "Preview as User" feature to verify permission effects before assigning to real users
