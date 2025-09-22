# Collab Hub UI Architecture

## Component Structure

```
app-ui/src/components/collab/
├── layout/
│   ├── CollabLayout.tsx          # Main layout wrapper
│   ├── ProjectSelector.tsx       # Project context selector
│   └── RoleIndicator.tsx         # Show current user role
├── dashboard/
│   ├── CollabDashboard.tsx       # Main dashboard page
│   ├── DashboardCard.tsx         # Reusable card component
│   └── QuickStats.tsx            # Quick statistics
├── projects/
│   ├── ProjectList.tsx           # Projects listing
│   ├── ProjectCard.tsx           # Project card component
│   ├── CreateProjectModal.tsx    # Create project modal
│   ├── EditProjectModal.tsx      # Edit project modal
│   └── MembersManagement.tsx     # Manage project members
├── tasks/
│   ├── TaskBoard.tsx             # Kanban board (4 columns)
│   ├── TaskCard.tsx              # Individual task card
│   ├── TaskColumn.tsx            # Kanban column
│   ├── CreateTaskModal.tsx       # Create task modal
│   ├── EditTaskModal.tsx         # Edit task modal
│   └── TaskFilters.tsx           # Task filtering
├── dailies/
│   ├── DailyReportsSection.tsx   # Daily reports main section
│   ├── DailyForm.tsx             # Daily input form
│   ├── DailyList.tsx             # List of daily reports
│   ├── DailyCard.tsx             # Individual daily card
│   └── DailyFilters.tsx          # Daily filtering
├── summary/
│   ├── SummaryDashboard.tsx      # Summary for PM
│   ├── BlockersList.tsx          # List of blockers
│   ├── TaskCounters.tsx          # Task status counters
│   ├── WorkloadIndicator.tsx     # Team workload
│   └── RecentActivities.tsx      # Recent task activities
└── common/
    ├── ProjectContext.tsx        # Project context provider
    ├── RoleBasedComponent.tsx    # Role-based rendering
    ├── LoadingCard.tsx           # Loading state for cards
    └── EmptyState.tsx            # Empty state component
```

## Main Dashboard Layout

### 1. CollabDashboard.tsx - Single Page Layout
```typescript
interface DashboardSection {
  id: string;
  title: string;
  component: React.ComponentType;
  roles: string[]; // Which roles can see this section
  span: number; // Grid span (1-2)
}

const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: 'daily-input',
    title: 'Báo cáo Daily',
    component: DailyForm,
    roles: ['PM', 'BC', 'DEV', 'QC'],
    span: 1
  },
  {
    id: 'task-board',
    title: 'Bảng công việc',
    component: TaskBoard,
    roles: ['PM', 'BC', 'DEV', 'QC'],
    span: 2
  },
  {
    id: 'daily-summary',
    title: 'Tổng hợp Daily',
    component: DailyList,
    roles: ['PM', 'BC'],
    span: 1
  },
  {
    id: 'blockers',
    title: 'Vướng mắc',
    component: BlockersList,
    roles: ['PM'],
    span: 1
  },
  {
    id: 'task-counters',
    title: 'Thống kê Task',
    component: TaskCounters,
    roles: ['PM', 'BC'],
    span: 1
  },
  {
    id: 'workload',
    title: 'Tải công việc',
    component: WorkloadIndicator,
    roles: ['PM'],
    span: 1
  }
];
```

### 2. Responsive Grid Layout
```scss
.collab-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .dashboard-header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  .dashboard-card {
    background: white;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    overflow: hidden;

    &.span-2 {
      grid-column: span 2;
      
      @media (max-width: 1200px) {
        grid-column: span 1;
      }
    }

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
      
      .card-title {
        font-weight: 600;
        font-size: 16px;
        margin: 0;
      }
    }

    .card-content {
      max-height: 400px;
      overflow-y: auto;
      padding: 20px;
    }
  }
}
```

## Component Design Principles

### 1. Card-Based Architecture
- Mỗi section là một card độc lập
- Card có header, content, và optional footer
- Content có scroll nội bộ khi quá dài
- Responsive: stack vertically trên mobile

### 2. Role-Based Rendering
```typescript
interface RoleBasedComponentProps {
  allowedRoles: string[];
  userRole: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  allowedRoles,
  userRole,
  children,
  fallback = null
}) => {
  if (!allowedRoles.includes(userRole)) {
    return fallback;
  }
  
  return <>{children}</>;
};
```

### 3. Project Context
```typescript
interface ProjectContextType {
  currentProject: Project | null;
  userRole: string | null;
  projects: Project[];
  switchProject: (projectId: string) => void;
  refreshProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};
```

## Task Board Design (Kanban)

### TaskBoard.tsx Structure
```typescript
interface TaskBoardProps {
  projectId: string;
}

const TASK_COLUMNS = [
  { id: 'todo', title: 'Cần làm', status: 'todo', color: '#f0f0f0' },
  { id: 'in_process', title: 'Đang làm', status: 'in_process', color: '#e6f7ff' },
  { id: 'ready_for_qc', title: 'Chờ QC', status: 'ready_for_qc', color: '#fff7e6' },
  { id: 'done', title: 'Hoàn thành', status: 'done', color: '#f6ffed' }
];

const TaskBoard: React.FC<TaskBoardProps> = ({ projectId }) => {
  return (
    <div className="task-board">
      <div className="board-columns">
        {TASK_COLUMNS.map(column => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={tasks.filter(t => t.status === column.status)}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>
    </div>
  );
};
```

### TaskColumn.tsx with Drag & Drop
```scss
.task-column {
  flex: 1;
  min-width: 280px;
  background: #fafafa;
  border-radius: 8px;
  margin: 0 8px;

  .column-header {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .column-title {
      font-weight: 600;
      font-size: 14px;
    }

    .task-count {
      background: #d9d9d9;
      color: #666;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
  }

  .column-content {
    padding: 12px;
    max-height: 500px;
    overflow-y: auto;
    min-height: 200px;
  }
}
```

## Daily Reports Section

### DailyForm.tsx - Compact Input
```typescript
interface DailyFormData {
  yesterday: string;
  today: string;
  blockers: string;
}

const DailyForm: React.FC = () => {
  return (
    <Form layout="vertical" size="small">
      <Form.Item label="Hôm qua đã làm" name="yesterday">
        <TextArea rows={2} placeholder="Mô tả công việc đã hoàn thành..." />
      </Form.Item>
      
      <Form.Item label="Hôm nay sẽ làm" name="today">
        <TextArea rows={2} placeholder="Kế hoạch công việc hôm nay..." />
      </Form.Item>
      
      <Form.Item label="Vướng mắc" name="blockers">
        <TextArea rows={2} placeholder="Khó khăn cần hỗ trợ..." />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" size="small">
          Cập nhật Daily
        </Button>
      </Form.Item>
    </Form>
  );
};
```

## State Management

### Using React Query for Data Fetching
```typescript
// hooks/useProjects.ts
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// hooks/useTasks.ts
export const useTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => apiClient.getTasks(projectId),
    enabled: !!projectId,
  });
};

// hooks/useDailies.ts
export const useDailies = (projectId: string, date: string) => {
  return useQuery({
    queryKey: ['dailies', projectId, date],
    queryFn: () => apiClient.getDailies(projectId, date),
    enabled: !!projectId && !!date,
  });
};
```

## Performance Optimizations

1. **Lazy Loading**: Load components only when needed
2. **Virtual Scrolling**: For long lists of tasks/dailies
3. **Debounced Search**: For filtering
4. **Optimistic Updates**: For better UX
5. **Memoization**: Prevent unnecessary re-renders
