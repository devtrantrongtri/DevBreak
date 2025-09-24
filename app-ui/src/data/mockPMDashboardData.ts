import { format, subDays, addDays } from 'date-fns';
import { PMDashboardData, UserProgressData, Task, Daily } from '@/types/collab';

// Mock tasks data
const mockTasks: Task[] = [
  {
    id: 'TASK-001',
    code: 'TASK-001',
    title: 'Implement user authentication API',
    description: 'Develop JWT-based authentication system with refresh tokens',
    status: 'done',
    priority: 'high',
    assigneeId: 'user-1',
    assignee: {
      id: 'user-1',
      displayName: 'Nguyễn Văn A',
      email: 'nguyenvana@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA'
    },
    projectId: 'demo-project-1',
    createdBy: 'pm-1',
    createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    dueDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    estimatedHours: 16,
    actualHours: 14,
    tags: ['backend', 'security'],
    isActive: true
  },
  {
    id: 'TASK-002',
    code: 'TASK-002', 
    title: 'Design user dashboard UI',
    description: 'Create responsive dashboard layout with charts and widgets',
    status: 'in_process',
    priority: 'medium',
    assigneeId: 'user-1',
    assignee: {
      id: 'user-1',
      displayName: 'Nguyễn Văn A',
      email: 'nguyenvana@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA'
    },
    projectId: 'demo-project-1',
    createdBy: 'pm-1',
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    estimatedHours: 12,
    actualHours: 8,
    tags: ['frontend', 'ui'],
    isActive: true
  },
  {
    id: 'TASK-003',
    code: 'TASK-003',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline',
    status: 'ready_for_qc',
    priority: 'high',
    assigneeId: 'user-2',
    assignee: {
      id: 'user-2',
      displayName: 'Trần Thị B',
      email: 'tranthib@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiB'
    },
    projectId: 'demo-project-1',
    createdBy: 'pm-1',
    createdAt: format(subDays(new Date(), 4), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    estimatedHours: 20,
    actualHours: 18,
    tags: ['devops', 'automation'],
    isActive: true
  },
  {
    id: 'TASK-004',
    code: 'TASK-004',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints with examples',
    status: 'todo',
    priority: 'low',
    assigneeId: 'user-3',
    assignee: {
      id: 'user-3',
      displayName: 'Lê Văn C',
      email: 'levanc@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeVanC'
    },
    projectId: 'demo-project-1',
    createdBy: 'pm-1',
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    estimatedHours: 8,
    actualHours: 0,
    tags: ['documentation'],
    isActive: true
  },
  {
    id: 'TASK-005',
    code: 'TASK-005',
    title: 'Fix authentication bug',
    description: 'Resolve token expiration issue causing logout loops',
    status: 'in_process',
    priority: 'critical',
    assigneeId: 'user-1',
    assignee: {
      id: 'user-1',
      displayName: 'Nguyễn Văn A',
      email: 'nguyenvana@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA'
    },
    projectId: 'demo-project-1',
    createdBy: 'pm-1',
    createdAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    estimatedHours: 4,
    actualHours: 2,
    tags: ['bug', 'critical'],
    isActive: true
  }
];

// Mock daily reports
const mockDailies: Daily[] = [
  {
    id: 'daily-1',
    userId: 'user-1',
    projectId: 'demo-project-1',
    reportDate: format(new Date(), 'yyyy-MM-dd'),
    yesterday: `Hoàn thành @TASK-001 về authentication API. Đã implement JWT tokens và refresh mechanism. Test coverage đạt 95%. Review code với team lead.`,
    today: `Sẽ tiếp tục làm @TASK-002 về dashboard UI. Dự kiến hoàn thành layout chính và integrate với API. Sau đó sẽ fix bug @TASK-005 về token expiration.`,
    blockers: `Cần hỗ trợ về API authentication từ backend team. Đang chờ clarify requirements cho dashboard widgets.`,
    createdAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    user: {
      id: 'user-1',
      displayName: 'Nguyễn Văn A',
      email: 'nguyenvana@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA'
    }
  },
  {
    id: 'daily-2',
    userId: 'user-2',
    projectId: 'demo-project-1',
    reportDate: format(new Date(), 'yyyy-MM-dd'),
    yesterday: `Hoàn thành setup CI/CD pipeline @TASK-003. Đã configure Docker containers và automated testing. Deploy thành công lên staging environment.`,
    today: `Sẽ optimize build time và setup monitoring cho production. Review security configurations và update documentation.`,
    blockers: `Không có vướng mắc đặc biệt. Team đang làm việc hiệu quả.`,
    createdAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    user: {
      id: 'user-2',
      displayName: 'Trần Thị B',
      email: 'tranthib@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiB'
    }
  },
  {
    id: 'daily-3',
    userId: 'user-3',
    projectId: 'demo-project-1',
    reportDate: format(new Date(), 'yyyy-MM-dd'),
    yesterday: `Research về API documentation tools. So sánh Swagger, Postman, và GitBook. Tạo outline cho @TASK-004.`,
    today: `Bắt đầu viết documentation cho authentication endpoints. Setup Swagger UI và tạo examples.`,
    blockers: `Cần access vào staging environment để test APIs. Chờ credentials từ DevOps team.`,
    createdAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    user: {
      id: 'user-3',
      displayName: 'Lê Văn C',
      email: 'levanc@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeVanC'
    }
  }
];

// Generate realistic progress history
const generateProgressHistory = (userId: string, currentCompleted: number, currentTotal: number) => {
  const history = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dayProgress = Math.max(0, currentCompleted - Math.floor(Math.random() * 3));
    const dayTotal = Math.max(dayProgress, currentTotal - Math.floor(Math.random() * 2));
    const throughput = i === 0 ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
    
    history.push({
      date: format(date, 'yyyy-MM-dd'),
      completed: dayProgress,
      total: dayTotal,
      throughput
    });
  }
  
  return history;
};

// Create realistic user progress data
export const generateMockPMDashboardData = (projectId: string, reportDate: string): PMDashboardData => {
  const userProgressData: UserProgressData[] = [
    {
      userId: 'user-1',
      user: {
        id: 'user-1',
        displayName: 'Nguyễn Văn A',
        email: 'nguyenvana@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA'
      },
      role: 'DEV',
      dailyReport: mockDailies.find(d => d.userId === 'user-1'),
      taskStats: {
        todo: 1,
        in_process: 2,
        ready_for_qc: 0,
        done: 8,
        total: 11,
        completedToday: 1,
        overdue: 1
      },
      progressHistory: generateProgressHistory('user-1', 8, 11),
      recentTasks: mockTasks.filter(t => t.assigneeId === 'user-1')
    },
    {
      userId: 'user-2',
      user: {
        id: 'user-2',
        displayName: 'Trần Thị B',
        email: 'tranthib@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiB'
      },
      role: 'DEV',
      dailyReport: mockDailies.find(d => d.userId === 'user-2'),
      taskStats: {
        todo: 2,
        in_process: 1,
        ready_for_qc: 3,
        done: 12,
        total: 18,
        completedToday: 2,
        overdue: 0
      },
      progressHistory: generateProgressHistory('user-2', 12, 18),
      recentTasks: mockTasks.filter(t => t.assigneeId === 'user-2')
    },
    {
      userId: 'user-3',
      user: {
        id: 'user-3',
        displayName: 'Lê Văn C',
        email: 'levanc@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeVanC'
      },
      role: 'QC',
      dailyReport: mockDailies.find(d => d.userId === 'user-3'),
      taskStats: {
        todo: 4,
        in_process: 1,
        ready_for_qc: 0,
        done: 6,
        total: 11,
        completedToday: 0,
        overdue: 2
      },
      progressHistory: generateProgressHistory('user-3', 6, 11),
      recentTasks: mockTasks.filter(t => t.assigneeId === 'user-3')
    }
  ];

  return {
    projectId,
    reportDate,
    teamProgress: userProgressData,
    projectStats: {
      totalTasks: 45,
      completedTasks: 32,
      overdueTasks: 3,
      blockedUsers: 1,
      averageThroughput: 1.2
    }
  };
};

export { mockTasks, mockDailies };
