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
    assignedTo: 'user-1',
    assignee: {
      id: 'user-1',
      displayName: 'Nguyễn Văn A',
      email: 'nguyenvana@company.com'
    },
    projectId: 'demo-project-1',
    createdBy: 'pm-1',
    creator: {
      id: 'pm-1',
      displayName: 'PM User',
      email: 'pm@company.com'
    },
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
    assignedTo: 'user-1',
    assignee: {
      id: 'user-1',
      displayName: 'Nguyễn Văn A',
      email: 'nguyenvana@company.com'
    },
    projectId: 'demo-project-1',
    createdBy: 'pm-1',
    creator: {
      id: 'pm-1',
      displayName: 'PM User',
      email: 'pm@company.com'
    },
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    estimatedHours: 12,
    actualHours: 8,
    tags: ['frontend', 'ui'],
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
    yesterday: `Hoàn thành @TASK-001 về authentication API. Đã implement JWT tokens và refresh mechanism.`,
    today: `Sẽ tiếp tục làm @TASK-002 về dashboard UI. Dự kiến hoàn thành layout chính.`,
    blockers: `Cần hỗ trợ về API authentication từ backend team.`,
    createdAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    user: {
      id: 'user-1',
      displayName: 'Nguyễn Văn A',
      email: 'nguyenvana@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA'
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
      recentTasks: mockTasks.filter(t => t.assignedTo === 'user-1')
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
