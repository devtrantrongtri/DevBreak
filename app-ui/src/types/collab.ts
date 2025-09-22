// Collab Hub Types

export interface Project {
  id: string;
  name: string;
  description?: string;
  code: string;
  status: 'active' | 'inactive' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    displayName: string;
    email: string;
  };
  members: ProjectMember[];
  memberCount: number;
  isActive: boolean;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'PM' | 'BC' | 'DEV' | 'QC';
  joinedAt: string;
  isActive: boolean;
  user: {
    id: string;
    displayName: string;
    email: string;
    avatar?: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_process' | 'ready_for_qc' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reporterId: string;
  assigneeId?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    displayName: string;
    email: string;
  };
  assignee?: {
    id: string;
    displayName: string;
    email: string;
  };
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'assigned' | 'status_changed' | 'commented';
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
}

export interface Daily {
  id: string;
  projectId: string;
  userId: string;
  reportDate: string;
  yesterday?: string;
  today?: string;
  blockers?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
}

export interface SummaryData {
  blockers: Daily[];
  taskCounters: {
    todo: number;
    in_process: number;
    ready_for_qc: number;
    done: number;
  };
  workloadAnalysis: {
    overloaded: ProjectMember[];
    underloaded: ProjectMember[];
  };
  recentActivities: TaskActivity[];
}

// DTOs
export interface CreateProjectDto {
  name: string;
  description?: string;
  code: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  status?: 'active' | 'inactive' | 'completed' | 'archived';
}

export interface CreateTaskDto {
  projectId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: 'todo' | 'in_process' | 'ready_for_qc' | 'done';
}

export interface CreateDailyDto {
  projectId: string;
  reportDate: string;
  yesterday?: string;
  today?: string;
  blockers?: string;
}

export interface UpdateDailyDto extends Partial<Omit<CreateDailyDto, 'projectId' | 'reportDate'>> {}

// UI Types
export interface DashboardSection {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  roles: string[];
  span: 1 | 2;
  props?: any;
}

export interface TaskColumn {
  id: string;
  title: string;
  status: Task['status'];
  color: string;
}

// Constants
export const PROJECT_ROLES = {
  PM: 'Project Manager',
  BC: 'Business Consultant',
  DEV: 'Developer',
  QC: 'Quality Control'
} as const;

export const TASK_STATUSES = {
  todo: 'Cần làm',
  in_process: 'Đang làm',
  ready_for_qc: 'Chờ QC',
  done: 'Hoàn thành'
} as const;

export const TASK_PRIORITIES = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  urgent: 'Khẩn cấp'
} as const;

export const PROJECT_STATUSES = {
  active: 'Đang hoạt động',
  inactive: 'Tạm dừng',
  completed: 'Hoàn thành',
  archived: 'Lưu trữ'
} as const;
