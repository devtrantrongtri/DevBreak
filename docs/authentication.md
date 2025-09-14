# Authentication Module

## Overview

The Authentication module handles user authentication, authorization, and session management. It implements JWT-based authentication and integrates with the Permission System to enforce access control throughout the application.

## Core Features

- **User Login**: Authenticate users with email and password
- **JWT Token Management**: Generate, validate, and refresh JWT tokens
- **Permission Verification**: Check user permissions for protected routes and actions
- **User Context**: Provide user data and permissions throughout the application

## Components

### 1. AuthContext

Located at `app-ui/src/contexts/AuthContext.tsx`

This React context provides authentication state and functions throughout the application:

```typescript
interface AuthContextType {
  user: UserProfile | null;
  permissions: string[];
  menuTree: MenuTreeItem[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  hasPermission: (permission: string | string[]) => boolean;
}
```

Key functions:
- `login`: Authenticate user and store JWT token
- `logout`: Clear user session
- `refreshUserData`: Reload user data, permissions, and menu tree
- `hasPermission`: Check if user has specific permission(s)

### 2. Login Page

Located at `app-ui/src/app/login/page.tsx`

Provides the login form with:
- Email and password fields
- Form validation
- Error handling
- Remember me option

### 3. Auth API Client

Located in `app-ui/src/lib/api.ts`

Handles API requests related to authentication:
- `login`: Send credentials and receive JWT token
- `me`: Get current user profile and permissions
- `refreshToken`: Get a new JWT token using a refresh token

## JWT Token Handling

The application uses two types of tokens:
1. **Access Token**: Short-lived token (15-60 minutes) for API authorization
2. **Refresh Token**: Longer-lived token (7-30 days) for obtaining new access tokens

Tokens are stored in:
- Local storage for persistent sessions
- Memory for session-only authentication

## Permission-Based Authorization

The AuthContext integrates with the Permission System to:
1. Load user permissions on login and refresh
2. Provide permission checking functionality to components
3. Filter menu items based on user permissions

## Protected Routes

Routes are protected using:
1. **Client-side guards**: Redirect unauthenticated users to login
2. **Server-side middleware**: Validate JWT tokens and check permissions
3. **Component-level checks**: Hide or disable UI elements based on permissions

## Usage Guidelines

### Authentication Flow

1. User enters credentials on login page
2. System validates credentials and returns JWT tokens
3. Tokens are stored and used for subsequent API requests
4. User permissions and menu tree are loaded
5. UI adapts based on user permissions

### Permission Checks in Components

```typescript
// Check if user has a single permission
const { hasPermission } = useAuth();
const canCreateUser = hasPermission('user.create');

// Check if user has any of multiple permissions
const canManageUsers = hasPermission(['user.create', 'user.update', 'user.delete']);

// Conditional rendering based on permissions
{canCreateUser && <Button>Create User</Button>}
```

### Refreshing User Data

After operations that might change permissions (like group assignments):

```typescript
const { refreshUserData } = useAuth();
await refreshUserData();
```

## Security Considerations

1. **Token Expiration**: Access tokens expire quickly to minimize risk
2. **HTTPS**: All API communication uses HTTPS
3. **CSRF Protection**: Tokens are validated against CSRF attacks
4. **XSS Prevention**: Tokens are stored with appropriate flags
5. **Rate Limiting**: Login attempts are rate-limited to prevent brute force attacks

## Troubleshooting

### Common Issues

1. **401 Unauthorized errors**: Check if token has expired or is invalid
2. **403 Forbidden errors**: User lacks required permissions
3. **Login failures**: Verify credentials and account status
4. **Session unexpectedly ending**: Check token expiration settings

### Best Practices

1. Call `refreshUserData()` after operations that change permissions
2. Always use `hasPermission()` for conditional rendering
3. Implement proper error handling for authentication failures
4. Log out users when their permissions change significantly
