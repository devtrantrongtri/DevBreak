# PostgreSQL Column Naming Fixes

## Issue Summary

The NestJS application was encountering `QueryFailedError` exceptions when executing dashboard queries due to column naming mismatches between raw SQL queries and the actual PostgreSQL database schema.

## Root Cause Analysis

### TypeORM Column Naming Convention
- **TypeORM Entities**: Use camelCase field names (e.g., `createdAt`, `isActive`)
- **PostgreSQL Database**: TypeORM preserves camelCase as-is in PostgreSQL (e.g., `"createdAt"`, `"isActive"`)
- **Raw SQL Queries**: Were incorrectly using snake_case (e.g., `created_at`, `is_active`)

### Entity Field Mappings
Based on entity analysis:

**User Entity (`users` table):**
- `createdAt` → `"createdAt"` (not `created_at`)
- `updatedAt` → `"updatedAt"` (not `updated_at`)
- `isActive` → `"isActive"` (not `is_active`)

**Group Entity (`groups` table):**
- `createdAt` → `"createdAt"` (not `created_at`)
- `updatedAt` → `"updatedAt"` (not `updated_at`)
- `isActive` → `"isActive"` (not `is_active`)

**ActivityLog Entity (`activity_logs` table):**
- `createdAt` → `"createdAt"` (not `created_at`)
- `resourceId` → `"resourceId"` (not `resource_id`)

## Specific Errors Fixed

### 1. getUserGrowthData Method (Lines 59-67, 72-80)
**Before:**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_users
FROM users 
WHERE created_at >= $1 
```

**After:**
```sql
SELECT 
  DATE_TRUNC('month', "createdAt") as month,
  COUNT(*) as new_users
FROM users 
WHERE "createdAt" >= $1 
```

### 2. getActivityTrends Method (Lines 105-113)
**Before:**
```sql
SELECT 
  DATE(created_at) as date,
  action,
  COUNT(*) as count
FROM activity_logs 
WHERE created_at >= $1 
```

**After:**
```sql
SELECT 
  DATE("createdAt") as date,
  action,
  resource,
  COUNT(*) as count
FROM activity_logs 
WHERE "createdAt" >= $1 
GROUP BY DATE("createdAt"), action, resource
```

**Additional Fix:** Added `resource` field to SELECT and GROUP BY clauses to support the `processActivityTrends` method.

### 3. getMostActiveGroup Method (Lines 164-174)
**Before:**
```sql
SELECT 
  g.name,
  COUNT(ug.user_id) as user_count
FROM groups g
LEFT JOIN user_groups ug ON g.id = ug.group_id
WHERE g.is_active = true
```

**After:**
```sql
SELECT 
  g.name,
  COUNT(ug.user_id) as user_count
FROM groups g
LEFT JOIN user_groups ug ON g.id = ug.group_id
WHERE g."isActive" = true
```

## Additional Improvements

### 1. Removed Unused Query
- Removed unused `totalUsersQuery` variable in `getUserGrowthData` method
- Cleaned up code to eliminate TypeScript warnings

### 2. Enhanced Activity Trends Query
- Added `resource` field to support filtering by resource type in `processActivityTrends`
- Updated GROUP BY clause to include resource field

## PostgreSQL Naming Best Practices

### 1. Column Name Quoting
- Always use double quotes for camelCase column names in PostgreSQL
- Example: `"createdAt"`, `"isActive"`, `"resourceId"`

### 2. TypeORM vs Raw SQL
- **Preferred**: Use TypeORM Query Builder when possible (automatically handles column naming)
- **Raw SQL**: Only when complex queries are needed, ensure column names match entity definitions

### 3. Consistency Check
```typescript
// ✅ Good - TypeORM Query Builder
this.userRepository
  .createQueryBuilder('user')
  .where('user.createdAt >= :today', { today })
  .getCount();

// ✅ Good - Raw SQL with correct column names
const query = `
  SELECT COUNT(*) 
  FROM users 
  WHERE "createdAt" >= $1
`;

// ❌ Bad - Raw SQL with incorrect column names
const query = `
  SELECT COUNT(*) 
  FROM users 
  WHERE created_at >= $1
`;
```

## Verification Steps

1. **Database Schema Check**: Verify actual column names in PostgreSQL
2. **Entity Definition Review**: Ensure entity fields match database columns
3. **Query Testing**: Test all dashboard endpoints to confirm fixes work
4. **Error Monitoring**: Monitor for any remaining column naming issues

## Files Modified

- `app-server/src/dashboard/dashboard.service.ts`
  - Fixed `getUserGrowthData` method (3 SQL queries)
  - Fixed `getActivityTrends` method (1 SQL query)
  - Fixed `getMostActiveGroup` method (1 SQL query)
  - Removed unused `totalUsersQuery` variable

## Testing Recommendations

1. **Unit Tests**: Create tests for each dashboard service method
2. **Integration Tests**: Test actual database queries with real data
3. **Error Handling**: Verify proper error messages for any remaining issues
4. **Performance**: Monitor query performance after fixes

## Prevention Strategies

1. **Code Review**: Always review raw SQL queries for column naming
2. **Linting**: Consider adding custom ESLint rules for SQL column naming
3. **Documentation**: Document entity-to-database column mappings
4. **TypeORM Migration**: Use TypeORM migrations to ensure schema consistency
