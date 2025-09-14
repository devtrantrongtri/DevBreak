# Development Guidelines

This document provides guidelines and best practices for developing and extending the DevBreak application.

## Code Organization

### Frontend (app-ui)

The frontend code follows a feature-based organization:

```
src/
├── app/               # Next.js pages
│   ├── dashboard/     # Dashboard and admin pages
│   ├── login/         # Authentication pages
│   └── ...
├── components/        # Reusable components
│   ├── MenuManagement/
│   ├── PermissionManagement/
│   ├── UserManagement/
│   └── ...
├── contexts/          # React contexts
│   ├── AuthContext.tsx
│   └── ...
├── lib/               # Utilities and services
│   ├── api.ts         # API client
│   └── ...
└── types/             # TypeScript type definitions
    └── api.ts         # API response types
```

### Backend (app-server)

The backend code follows a module-based organization:

```
src/
├── auth/              # Authentication module
├── users/             # User management module
├── groups/            # Group management module
├── permissions/       # Permission management module
├── menus/             # Menu management module
├── database/          # Database configuration
└── entities/          # TypeORM entities
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for props, state, and API responses
- Use proper type annotations for functions and variables
- Avoid using `any` type when possible

### React Components

- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use proper prop types and default props

### API Integration

- Use the centralized API client in `src/lib/api.ts`
- Handle loading states and errors consistently
- Use appropriate error handling and user feedback

## Adding New Features

### Adding a New Page

1. Create a new page in `app/dashboard/[feature]/page.tsx`
2. Add necessary permissions in the backend
3. Create a new menu item in the database
4. Implement proper permission checks

### Adding a New Component

1. Create component in the appropriate feature folder
2. Export the component from an index.ts file
3. Use consistent naming conventions
4. Include proper TypeScript types

### Adding a New API Endpoint

1. Create a new controller in the appropriate module
2. Implement proper validation using DTOs
3. Add permission guards
4. Update the API client in the frontend

## Permission System

### Adding New Permissions

1. Follow the `resource.action` naming convention
2. Consider the permission hierarchy
3. Update the database seed data if necessary
4. Document the new permission

### Permission Checks

In the frontend:
```typescript
const { hasPermission } = useAuth();
if (hasPermission('resource.action')) {
  // Perform action
}
```

In the backend:
```typescript
@UseGuards(JwtAuthGuard, PermissionGuard)
@Permission('resource.action')
@Get()
findAll() {
  // Implementation
}
```

## Menu System

### Menu-Permission Relationship

- Each menu item is linked to exactly one permission
- The menu is only visible if the user has that permission AND all parent permissions
- Parent menus with children should expand/collapse on click rather than navigate

### Adding a New Menu

1. Create the menu in the database with:
   - Name
   - Path
   - Icon
   - Parent menu (if applicable)
   - Permission code
   - Order
   - Active status
2. Ensure the permission exists or create it

## Testing

### Frontend Testing

- Use Jest for unit tests
- Use React Testing Library for component tests
- Test permission-based rendering
- Mock API calls using MSW

### Backend Testing

- Use Jest for unit tests
- Use supertest for API tests
- Test permission guards
- Use in-memory database for tests

## Deployment

### Environment Variables

Frontend (.env):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Backend (.env):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devbreak
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
```

### Build and Deploy

Frontend:
```bash
cd app-ui
npm run build
npm start
```

Backend:
```bash
cd app-server
npm run build
npm run start:prod
```

## Common Pitfalls to Avoid

1. **Ignoring Permission Hierarchy**: Remember that child permissions require parent permissions
2. **Direct Permission Assignment**: Always assign permissions through groups, not directly to users
3. **Forgetting to Refresh**: After operations that change permissions, call `refreshUserData()`
4. **Missing API Guards**: Always add permission guards to API endpoints
5. **Hardcoding Permissions**: Use constants for permission codes to avoid typos

## Performance Considerations

1. **Menu Rendering**: The menu tree should be calculated server-side to minimize client-side processing
2. **Permission Caching**: Cache permission checks to avoid recalculating on every render
3. **API Pagination**: Use pagination for large data sets
4. **Optimistic Updates**: Implement optimistic UI updates for better user experience

## Troubleshooting Development Issues

1. **Permission Issues**: Check the effective permissions calculation in the AuthContext
2. **Menu Not Showing**: Verify the permission hierarchy and menu-permission binding
3. **API 403 Errors**: Check if the user has all required permissions, including parent permissions
4. **Component Rendering Issues**: Use React DevTools to inspect component props and state
