import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Project } from './projects/entities/project.entity';
import { ProjectMember } from './projects/entities/project-member.entity';
import { Task } from './tasks/entities/task.entity';
import { Daily } from './dailies/entities/daily.entity';

export async function seedCollabData(dataSource: DataSource) {
  console.log('🌱 Seeding Collab data...');

  const userRepository = dataSource.getRepository(User);
  const projectRepository = dataSource.getRepository(Project);
  const memberRepository = dataSource.getRepository(ProjectMember);
  const taskRepository = dataSource.getRepository(Task);
  const dailyRepository = dataSource.getRepository(Daily);

  // Get existing users
  const users = await userRepository.find({ take: 10 });
  if (users.length < 3) {
    console.log('❌ Need at least 3 users to seed collab data');
    return;
  }

  const [admin, user1, user2, ...otherUsers] = users;

  // Create sample project
  let project = await projectRepository.findOne({ where: { code: 'WEBAPP' } });
  if (!project) {
    project = projectRepository.create({
      name: 'Web Application Project',
      description: 'Dự án phát triển ứng dụng web cho khách hàng ABC Company',
      code: 'WEBAPP',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      createdBy: admin.id,
    });
    project = await projectRepository.save(project);
    console.log('✅ Created project:', project.name);
  }

  // Add project members
  const memberData = [
    { userId: admin.id, role: 'PM' },
    { userId: user1.id, role: 'DEV' },
    { userId: user2.id, role: 'DEV' },
    ...(otherUsers.slice(0, 2).map(u => ({ userId: u.id, role: Math.random() > 0.5 ? 'QC' : 'DEV' }))),
  ];

  for (const memberInfo of memberData) {
    const existingMember = await memberRepository.findOne({
      where: { projectId: project.id, userId: memberInfo.userId }
    });

    if (!existingMember) {
      const member = memberRepository.create({
        projectId: project.id,
        userId: memberInfo.userId,
        role: memberInfo.role,
        isActive: true,
      });
      await memberRepository.save(member);
      console.log(`✅ Added ${memberInfo.role} member:`, memberInfo.userId);
    }
  }

  // Create sample tasks
  const taskData = [
    {
      title: 'Implement User Authentication System',
      description: 'Develop JWT-based authentication with login, logout, and token refresh functionality. Include password hashing and validation.',
      status: 'done' as const,
      priority: 'high' as const,
      assignedTo: user1.id,
      dueDate: new Date('2024-01-15'),
      estimatedHours: 16,
      actualHours: 14,
    },
    {
      title: 'Design Dashboard UI Components',
      description: 'Create responsive dashboard layout with charts, widgets, and navigation. Follow design system guidelines.',
      status: 'in_process' as const,
      priority: 'medium' as const,
      assignedTo: user1.id,
      dueDate: new Date('2024-01-25'),
      estimatedHours: 20,
      actualHours: 8,
    },
    {
      title: 'Setup Database Schema',
      description: 'Design and implement database tables for users, projects, tasks, and daily reports. Include proper indexing.',
      status: 'done' as const,
      priority: 'high' as const,
      assignedTo: user2.id,
      dueDate: new Date('2024-01-10'),
      estimatedHours: 12,
      actualHours: 10,
    },
    {
      title: 'API Integration Testing',
      description: 'Write comprehensive tests for all API endpoints. Include unit tests and integration tests.',
      status: 'ready_for_qc' as const,
      priority: 'medium' as const,
      assignedTo: user2.id,
      dueDate: new Date('2024-01-30'),
      estimatedHours: 24,
      actualHours: 18,
    },
    {
      title: 'Mobile Responsive Design',
      description: 'Ensure all components work properly on mobile devices. Test on various screen sizes.',
      status: 'todo' as const,
      priority: 'low' as const,
      assignedTo: user1.id,
      dueDate: new Date('2024-02-05'),
      estimatedHours: 16,
      actualHours: 0,
    },
    {
      title: 'Performance Optimization',
      description: 'Optimize application performance, reduce bundle size, implement lazy loading.',
      status: 'todo' as const,
      priority: 'medium' as const,
      assignedTo: user2.id,
      dueDate: new Date('2024-02-10'),
      estimatedHours: 20,
      actualHours: 0,
    },
    {
      title: 'Security Audit',
      description: 'Conduct security review, fix vulnerabilities, implement security best practices.',
      status: 'todo' as const,
      priority: 'high' as const,
      assignedTo: otherUsers[0]?.id || user1.id,
      dueDate: new Date('2024-02-15'),
      estimatedHours: 32,
      actualHours: 0,
    },
  ];

  for (const taskInfo of taskData) {
    const existingTask = await taskRepository.findOne({
      where: { projectId: project.id, title: taskInfo.title }
    });

    if (!existingTask) {
      const task = taskRepository.create({
        ...taskInfo,
        projectId: project.id,
        createdBy: admin.id,
      });
      await taskRepository.save(task);
      console.log('✅ Created task:', taskInfo.title);
    }
  }

  // Create daily reports for today
  const today = new Date().toISOString().split('T')[0];
  const dailyData = [
    {
      userId: user1.id,
      yesterday: `Hoàn thành @TASK-001 về authentication API. Đã implement JWT tokens và refresh mechanism. Test coverage đạt 95%. Review code với team lead và fix các issues được point out.`,
      today: `Sẽ tiếp tục làm @TASK-002 về dashboard UI. Dự kiến hoàn thành layout chính và integrate với API. Sau đó sẽ bắt đầu @TASK-005 về mobile responsive design.`,
      blockers: `Cần hỗ trợ về API authentication từ backend team. Đang chờ clarify requirements cho dashboard widgets từ PM.`,
    },
    {
      userId: user2.id,
      yesterday: `Hoàn thành @TASK-003 database schema design. Setup migration scripts và test data. Review @TASK-004 API integration testing với team.`,
      today: `Sẽ tiếp tục @TASK-004 API testing. Dự kiến hoàn thành unit tests cho user module. Sau đó sẽ bắt đầu @TASK-006 performance optimization.`,
      blockers: `Không có blockers. Đang làm việc theo đúng timeline.`,
    },
  ];

  if (otherUsers.length > 0) {
    dailyData.push({
      userId: otherUsers[0].id,
      yesterday: `Review code cho @TASK-001 và @TASK-003. Tìm thấy một số issues về security và performance. Đã tạo bug reports.`,
      today: `Sẽ bắt đầu @TASK-007 security audit. Dự kiến hoàn thành security checklist và penetration testing plan.`,
      blockers: `Cần access vào production environment để test security. Đang chờ DevOps team setup.`,
    });
  }

  for (const dailyInfo of dailyData) {
    const existingDaily = await dailyRepository.findOne({
      where: { projectId: project.id, userId: dailyInfo.userId, date: today }
    });

    if (!existingDaily) {
      const daily = dailyRepository.create({
        ...dailyInfo,
        projectId: project.id,
        date: today,
      });
      await dailyRepository.save(daily);
      console.log('✅ Created daily report for user:', dailyInfo.userId);
    }
  }

  console.log('🎉 Collab data seeding completed!');
}
