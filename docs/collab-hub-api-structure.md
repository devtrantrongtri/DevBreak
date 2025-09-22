# Collab Hub API Structure

## Module Organization

```
app-server/src/collab/
├── collab.module.ts
├── projects/
│   ├── projects.module.ts
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   ├── entities/
│   │   ├── project.entity.ts
│   │   └── project-member.entity.ts
│   └── dto/
│       ├── create-project.dto.ts
│       ├── update-project.dto.ts
│       └── manage-members.dto.ts
├── tasks/
│   ├── tasks.module.ts
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── entities/
│   │   ├── task.entity.ts
│   │   └── task-activity.entity.ts
│   └── dto/
│       ├── create-task.dto.ts
│       ├── update-task.dto.ts
│       └── task-filter.dto.ts
├── dailies/
│   ├── dailies.module.ts
│   ├── dailies.controller.ts
│   ├── dailies.service.ts
│   ├── entities/
│   │   └── daily.entity.ts
│   └── dto/
│       ├── create-daily.dto.ts
│       ├── update-daily.dto.ts
│       └── daily-filter.dto.ts
├── summary/
│   ├── summary.module.ts
│   ├── summary.controller.ts
│   ├── summary.service.ts
│   └── dto/
│       └── summary-filter.dto.ts
└── common/
    ├── guards/
    │   └── project-member.guard.ts
    ├── decorators/
    │   └── project-role.decorator.ts
    └── types/
        └── project-roles.enum.ts
```

## API Endpoints Design

### 1. Projects API (`/api/collab/projects`)

```typescript
// GET /api/collab/projects - Lấy danh sách projects user là member
// GET /api/collab/projects/:id - Lấy chi tiết project
// POST /api/collab/projects - Tạo project mới
// PUT /api/collab/projects/:id - Cập nhật project
// DELETE /api/collab/projects/:id - Xóa project

// Members management
// GET /api/collab/projects/:id/members - Lấy danh sách members
// POST /api/collab/projects/:id/members - Thêm member
// PUT /api/collab/projects/:id/members/:userId - Cập nhật role member
// DELETE /api/collab/projects/:id/members/:userId - Xóa member
```

### 2. Tasks API (`/api/collab/tasks`)

```typescript
// GET /api/collab/tasks?projectId=xxx - Lấy tasks theo project
// GET /api/collab/tasks/:id - Lấy chi tiết task
// POST /api/collab/tasks - Tạo task mới
// PUT /api/collab/tasks/:id - Cập nhật task
// DELETE /api/collab/tasks/:id - Xóa task

// Status management
// PUT /api/collab/tasks/:id/status - Cập nhật status
// PUT /api/collab/tasks/:id/assign - Gán task

// Activities
// GET /api/collab/tasks/:id/activities - Lấy lịch sử activities
```

### 3. Dailies API (`/api/collab/dailies`)

```typescript
// GET /api/collab/dailies?projectId=xxx&date=yyyy-mm-dd - Lấy dailies
// GET /api/collab/dailies/my?date=yyyy-mm-dd - Lấy daily của user hiện tại
// POST /api/collab/dailies - Tạo/cập nhật daily
// PUT /api/collab/dailies/:id - Cập nhật daily
// DELETE /api/collab/dailies/:id - Xóa daily
```

### 4. Summary API (`/api/collab/summary`)

```typescript
// GET /api/collab/summary/dashboard?projectId=xxx&date=yyyy-mm-dd
// Response: {
//   blockers: Daily[],
//   taskCounters: { todo: number, in_process: number, ready_for_qc: number, done: number },
//   workloadAnalysis: { overloaded: User[], underloaded: User[] },
//   recentActivities: TaskActivity[]
// }

// GET /api/collab/summary/blockers?projectId=xxx&date=yyyy-mm-dd
// GET /api/collab/summary/task-counters?projectId=xxx
// GET /api/collab/summary/workload?projectId=xxx
```

## DTOs Structure

### Project DTOs
```typescript
export class CreateProjectDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString() @IsNotEmpty()
  code: string;

  @IsDateString() @IsOptional()
  startDate?: string;

  @IsDateString() @IsOptional()
  endDate?: string;
}

export class ManageMembersDto {
  @IsUUID()
  userId: string;

  @IsEnum(['PM', 'BC', 'DEV', 'QC'])
  role: string;
}
```

### Task DTOs
```typescript
export class CreateTaskDto {
  @IsUUID()
  projectId: string;

  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsOptional()
  description?: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority: string;

  @IsUUID() @IsOptional()
  assigneeId?: string;

  @IsDateString() @IsOptional()
  dueDate?: string;
}

export class UpdateTaskStatusDto {
  @IsEnum(['todo', 'in_process', 'ready_for_qc', 'done'])
  status: string;

  @IsString() @IsOptional()
  comment?: string;
}
```

### Daily DTOs
```typescript
export class CreateDailyDto {
  @IsUUID()
  projectId: string;

  @IsDateString()
  reportDate: string;

  @IsString() @IsOptional()
  yesterday?: string;

  @IsString() @IsOptional()
  today?: string;

  @IsString() @IsOptional()
  blockers?: string;
}
```

## Guards & Decorators

### Project Member Guard
```typescript
@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('project-roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.projectId || request.body.projectId || request.query.projectId;

    // Check if user is member of project with required role
    return this.checkProjectMembership(user.id, projectId, requiredRoles);
  }
}

// Usage:
@UseGuards(ProjectMemberGuard)
@ProjectRoles(['PM', 'BC'])
@Post('tasks')
createTask(@Body() createTaskDto: CreateTaskDto) {
  // Only PM and BC can create tasks
}
```

## Permission Mapping

```typescript
// Role-based permissions per project
const ROLE_PERMISSIONS = {
  PM: [
    'collab.projects.view',
    'collab.projects.update',
    'collab.projects.manage_members',
    'collab.tasks.view',
    'collab.tasks.create',
    'collab.tasks.update',
    'collab.tasks.assign',
    'collab.dailies.view_all',
    'collab.summary.view'
  ],
  BC: [
    'collab.projects.view',
    'collab.tasks.view',
    'collab.tasks.create',
    'collab.tasks.update',
    'collab.dailies.view',
    'collab.dailies.create',
    'collab.dailies.update'
  ],
  DEV: [
    'collab.projects.view',
    'collab.tasks.view',
    'collab.tasks.update', // Only assigned tasks
    'collab.dailies.view',
    'collab.dailies.create',
    'collab.dailies.update'
  ],
  QC: [
    'collab.projects.view',
    'collab.tasks.view',
    'collab.tasks.update', // Only for QC status
    'collab.dailies.view',
    'collab.dailies.create',
    'collab.dailies.update'
  ]
};
```
