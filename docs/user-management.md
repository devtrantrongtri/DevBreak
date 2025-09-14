# User Management Module

## Overview

The User Management module handles all aspects of user accounts, including creation, modification, deletion, and group assignments. It works closely with the Group and Permission systems to implement Role-Based Access Control (RBAC).

## Core Features

- **User CRUD Operations**: Create, read, update, and delete user accounts
- **Group Assignment**: Assign users to groups to grant permissions
- **User Search**: Search and filter users by various criteria
- **User Profile Management**: Allow users to update their own profiles and change passwords

## Components

### 1. User List Component

Located at `app-ui/src/app/dashboard/users/page.tsx`

This page displays all users with:
- Searchable and sortable table
- Action buttons for editing and deleting users
- Group assignment indicators
- Permission-based rendering of action buttons

### 2. User Form Components

- **AddUserModal**: For creating new users
- **EditUserModal**: For updating existing users
- **DeleteUserModal**: Confirmation for user deletion

### 3. User Profile Components

- **ProfilePage**: User's own profile view and edit
- **ChangePasswordModal**: For changing user passwords

## API Integration

The User Management module interacts with the following API endpoints:

- `GET /users`: Retrieve all users (requires `system.users.manage` permission)
- `POST /users`: Create a new user (requires `user.create` permission)
- `GET /users/:id`: Get a specific user (requires `system.users.manage` permission)
- `PATCH /users/:id`: Update a user (requires `user.update` permission)
- `DELETE /users/:id`: Delete a user (requires `user.delete` permission)
- `POST /users/:id/groups`: Assign groups to a user (requires `group.update` permission)
- `GET /me`: Get current user profile (no special permission required)
- `PATCH /me`: Update current user profile (no special permission required)
- `POST /auth/change-password`: Change user password (no special permission required)

## User-Group Relationship

Users and groups have a many-to-many relationship:
- A user can belong to multiple groups
- A group can contain multiple users
- Users inherit all permissions from all their groups

## Usage Guidelines

### Creating Users

When creating a new user:
1. Provide a unique email address
2. Set an initial password (or generate one)
3. Assign appropriate groups based on the user's role
4. Set active status (active by default)

### Assigning Groups

When assigning groups to users:
1. Consider the principle of least privilege
2. Review the permissions that come with each group
3. Remember that users inherit all permissions from all their groups

### User Management Best Practices

1. **Regular Audits**: Periodically review user accounts and their group assignments
2. **Deactivation vs. Deletion**: Consider deactivating users instead of deleting them to preserve history
3. **Password Policies**: Enforce strong password policies
4. **Group-Based Assignments**: Manage permissions through groups rather than individual assignments

## Troubleshooting

### Common Issues

1. **User can't access certain features**: Check if the user has the necessary groups and permissions
2. **Changes to groups not taking effect**: Remember that permission changes may take up to 1 minute to propagate due to caching
3. **User locked out**: Reset password or check account status

### Security Considerations

1. All password fields are properly hashed in the database
2. Failed login attempts are tracked to prevent brute force attacks
3. JWT tokens have appropriate expiration times
4. Sensitive user operations are logged for audit purposes
