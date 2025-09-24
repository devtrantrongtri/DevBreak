import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto, UpdateMemberRoleDto, BulkAddMembersDto } from './dto/manage-members.dto';
import { UpdateComponentVisibilityDto, ResetComponentVisibilityDto, AddComponentDto } from './dto/component-visibility.dto';
import { ProjectComponentVisibility } from './entities/project-component-visibility.entity';
import { Daily } from '../dailies/entities/daily.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../../entities/User';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private memberRepository: Repository<ProjectMember>,
    @InjectRepository(ProjectComponentVisibility)
    private visibilityRepository: Repository<ProjectComponentVisibility>,
    @InjectRepository(Daily)
    private dailyRepository: Repository<Daily>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto, createdBy: string): Promise<Project> {
    // Check if code already exists
    const existingProject = await this.projectRepository.findOne({
      where: { code: createProjectDto.code }
    });

    if (existingProject) {
      throw new BadRequestException('Mã dự án đã tồn tại');
    }

    // Create project
    const project = this.projectRepository.create({
      ...createProjectDto,
      createdBy,
    });

    const savedProject = await this.projectRepository.save(project);

    // Auto-add creator as PM
    await this.addMember(savedProject.id, { userId: createdBy, role: 'PM' });

    return this.findOne(savedProject.id);
  }

  async findAll(userId: string): Promise<Project[]> {
    // Only return projects where user is a member
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.creator', 'creator')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser')
      .where('members.user_id = :userId AND members.is_active = true', { userId })
      .orderBy('project.updated_at', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['creator', 'members', 'members.user'],
    });

    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findOne(id);
    
    // Check if user has permission to update
    await this.checkProjectPermission(id, userId, ['PM']);

    // Check code uniqueness if updating code
    if (updateProjectDto.code && updateProjectDto.code !== project.code) {
      const existingProject = await this.projectRepository.findOne({
        where: { code: updateProjectDto.code }
      });

      if (existingProject) {
        throw new BadRequestException('Mã dự án đã tồn tại');
      }
    }

    await this.projectRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.checkProjectPermission(id, userId, ['PM']);
    
    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy dự án');
    }
  }

  // Members management
  async getMembers(projectId: string): Promise<ProjectMember[]> {
    return this.memberRepository.find({
      where: { projectId, isActive: true },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async addMember(projectId: string, addMemberDto: AddMemberDto): Promise<ProjectMember> {
    // Check if project exists
    await this.findOne(projectId);

    // Check if user is already a member
    const existingMember = await this.memberRepository.findOne({
      where: { projectId, userId: addMemberDto.userId }
    });

    if (existingMember) {
      if (existingMember.isActive) {
        throw new BadRequestException('User đã là thành viên của dự án');
      } else {
        // Reactivate member with new role
        existingMember.role = addMemberDto.role;
        existingMember.isActive = true;
        return this.memberRepository.save(existingMember);
      }
    }

    const member = this.memberRepository.create({
      projectId,
      ...addMemberDto,
    });

    return this.memberRepository.save(member);
  }

  async updateMemberRole(
    projectId: string, 
    userId: string, 
    updateMemberRoleDto: UpdateMemberRoleDto,
    requestUserId: string
  ): Promise<ProjectMember> {
    // Check permission
    await this.checkProjectPermission(projectId, requestUserId, ['PM']);

    const member = await this.memberRepository.findOne({
      where: { projectId, userId, isActive: true },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy thành viên trong dự án');
    }

    member.role = updateMemberRoleDto.role;
    return this.memberRepository.save(member);
  }

  async removeMember(projectId: string, userId: string, requestUserId: string): Promise<void> {
    // Check permission
    await this.checkProjectPermission(projectId, requestUserId, ['PM']);

    // Cannot remove yourself if you're the only PM
    if (userId === requestUserId) {
      const pmCount = await this.memberRepository.count({
        where: { projectId, role: 'PM', isActive: true }
      });

      if (pmCount <= 1) {
        throw new BadRequestException('Không thể xóa PM cuối cùng của dự án');
      }
    }

    const result = await this.memberRepository.update(
      { projectId, userId },
      { isActive: false }
    );

    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy thành viên trong dự án');
    }
  }

  // Helper methods
  async checkProjectPermission(projectId: string, userId: string, allowedRoles: string[]): Promise<ProjectMember> {
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('Bạn không phải là thành viên của dự án này');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }

    return member;
  }

  async getUserProjectRole(projectId: string, userId: string): Promise<string | null> {
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, isActive: true },
    });

    return member?.role || null;
  }

  async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, isActive: true },
    });

    return !!member;
  }

  async checkProjectMembership(projectId: string, userId: string): Promise<ProjectMember> {
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('Bạn không phải là thành viên của dự án này');
    }

    return member;
  }

  // Component Visibility Methods
  async updateComponentVisibility(
    projectId: string,
    dto: UpdateComponentVisibilityDto,
    userId: string
  ): Promise<ProjectComponentVisibility> {
    // Check if user is PM of the project
    const member = await this.checkProjectMembership(projectId, userId);
    if (member.role !== 'PM') {
      throw new ForbiddenException('Only PM can update component visibility');
    }

    // Find or create visibility setting
    let visibility = await this.visibilityRepository.findOne({
      where: { projectId, componentKey: dto.componentKey },
    });

    if (!visibility) {
      visibility = this.visibilityRepository.create({
        projectId,
        componentKey: dto.componentKey,
      });
    }

    // Update visibility settings
    visibility.isVisibleToAll = dto.isVisibleToAll;
    visibility.visibleRoles = dto.isVisibleToAll ? null : (dto.visibleRoles || []);

    return this.visibilityRepository.save(visibility);
  }

  async resetComponentVisibility(
    projectId: string,
    dto: ResetComponentVisibilityDto,
    userId: string
  ): Promise<{ message: string; componentKey: string }> {
    // Check if user is PM of the project
    const member = await this.checkProjectMembership(projectId, userId);
    if (member.role !== 'PM') {
      throw new ForbiddenException('Only PM can reset component visibility');
    }

    // Delete visibility setting (defaults to visible to all)
    await this.visibilityRepository.delete({
      projectId,
      componentKey: dto.componentKey,
    });

    return {
      message: 'Component visibility reset to default successfully',
      componentKey: dto.componentKey,
    };
  }

  async getComponentVisibility(projectId: string, userId: string): Promise<ProjectComponentVisibility[]> {
    // Check if user is member of the project
    await this.checkProjectMembership(projectId, userId);

    return this.visibilityRepository.find({
      where: { projectId },
    });
  }

  // Get all projects (for admin users)
  async findAllForAdmin(userId: string): Promise<Project[]> {
    // This method should only be called for users with admin permissions
    // The permission check will be done in the controller
    return this.projectRepository.find({
      relations: ['creator', 'members', 'members.user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Add existing global component to project
  async addGlobalComponentToProject(
    projectId: string,
    componentId: string,
    userId: string,
    overrides?: { isVisibleToAll?: boolean; visibleRoles?: string[] }
  ): Promise<ProjectComponentVisibility> {
    // Check if user is PM of the project
    const member = await this.checkProjectMembership(projectId, userId);
    if (member.role !== 'PM') {
      throw new ForbiddenException('Only PM can add components');
    }

    // This method now delegates to ComponentsService
    // The actual implementation should be moved to ComponentsService.addToProject()
    throw new BadRequestException('Use ComponentsService.addToProject() instead');
  }

  async searchTasks(projectId: string, userId: string, query: string): Promise<Task[]> {
    // Check if user is member of the project
    await this.checkProjectMembership(projectId, userId);

    if (!query || query.trim().length < 1) {
      return [];
    }

    const searchQuery = query.trim().toLowerCase();

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('task.project_id = :projectId', { projectId })
      .andWhere(
        '(LOWER(task.code) LIKE :search OR LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)',
        { search: `%${searchQuery}%` }
      )
      .orderBy('task.created_at', 'DESC')
      .limit(10)
      .getMany();

    return tasks;
  }

  async getPMDashboard(projectId: string, userId: string, date?: string): Promise<any> {
    // Check if user has access to project
    await this.checkProjectMembership(projectId, userId);

    const reportDate = date || new Date().toISOString().split('T')[0];

    // Get project members with their roles
    const members = await this.memberRepository.find({
      where: { projectId, isActive: true },
      relations: ['user'],
    });

    // Get daily reports for the date
    const dailies = await this.dailyRepository.find({
      where: { projectId, date: reportDate },
      relations: ['user'],
    });

    // Get tasks for the project
    const tasks = await this.taskRepository.find({
      where: { projectId },
      relations: ['assignee', 'creator'],
    });

    // Build team progress data
    const teamProgress = await Promise.all(
      members.map(async (member) => {
        const userTasks = tasks.filter(t => t.assignedTo === member.userId);
        const userDaily = dailies.find(d => d.userId === member.userId);

        // Calculate task statistics
        const taskStats = {
          todo: userTasks.filter(t => t.status === 'todo').length,
          in_process: userTasks.filter(t => t.status === 'in_process').length,
          ready_for_qc: userTasks.filter(t => t.status === 'ready_for_qc').length,
          done: userTasks.filter(t => t.status === 'done').length,
          total: userTasks.length,
          completedToday: userTasks.filter(t =>
            t.status === 'done' &&
            new Date(t.updatedAt).toISOString().split('T')[0] === reportDate
          ).length,
          overdue: userTasks.filter(t =>
            t.dueDate &&
            new Date(t.dueDate) < new Date(reportDate) &&
            t.status !== 'done'
          ).length,
        };

        // Generate progress history (last 7 days)
        const progressHistory: any[] = [];
        for (let i = 6; i >= 0; i--) {
          const historyDate = new Date();
          historyDate.setDate(historyDate.getDate() - i);
          const dateStr = historyDate.toISOString().split('T')[0];

          const completedByDate = userTasks.filter(t =>
            t.status === 'done' &&
            t.updatedAt <= historyDate
          ).length;

          progressHistory.push({
            date: dateStr,
            completed: completedByDate,
            total: userTasks.length,
            throughput: i === 0 ? taskStats.completedToday :
              Math.floor(Math.random() * 3), // Mock throughput for historical data
          });
        }

        return {
          userId: member.userId,
          user: {
            id: member.user.id,
            displayName: member.user.displayName,
            email: member.user.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.displayName}`,
          },
          role: member.role,
          dailyReport: userDaily ? {
            id: userDaily.id,
            userId: userDaily.userId,
            projectId: userDaily.projectId,
            reportDate: userDaily.date,
            yesterday: userDaily.yesterday,
            today: userDaily.today,
            blockers: userDaily.blockers,
            createdAt: userDaily.createdAt.toISOString(),
            updatedAt: userDaily.updatedAt.toISOString(),
            user: {
              id: member.user.id,
              displayName: member.user.displayName,
              email: member.user.email,
            },
          } : null,
          taskStats,
          progressHistory,
          recentTasks: userTasks.slice(0, 5).map(task => ({
            id: task.id,
            code: `TASK-${task.id.slice(-3).toUpperCase()}`,
            projectId: task.projectId,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assignedTo,
            assignee: task.assignee ? {
              id: task.assignee.id,
              displayName: task.assignee.displayName,
              email: task.assignee.email,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.displayName}`,
            } : null,
            createdBy: task.createdBy,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null,
            estimatedHours: task.estimatedHours,
            actualHours: task.actualHours,
            tags: [],
            isActive: true,
          })),
        };
      })
    );

    // Calculate project statistics
    const projectStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      overdueTasks: tasks.filter(t =>
        t.dueDate &&
        new Date(t.dueDate) < new Date(reportDate) &&
        t.status !== 'done'
      ).length,
      blockedUsers: dailies.filter(d => d.blockers && d.blockers.trim().length > 0).length,
      averageThroughput: teamProgress.reduce((sum, tp) =>
        sum + tp.taskStats.completedToday, 0
      ) / Math.max(teamProgress.length, 1),
    };

    return {
      projectId,
      reportDate,
      teamProgress,
      projectStats,
    };
  }
}
