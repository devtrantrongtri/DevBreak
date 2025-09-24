import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskActivity } from './entities/task-activity.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskActivity)
    private activityRepository: Repository<TaskActivity>,
    @InjectRepository(ProjectMember)
    private memberRepository: Repository<ProjectMember>,
  ) {}

  async create(createTaskDto: CreateTaskDto, createdBy: string): Promise<Task> {
    // Check if user is member of the project
    await this.checkProjectMembership(createTaskDto.projectId, createdBy);

    // If assignedTo is provided, check if they are project member
    if (createTaskDto.assignedTo) {
      await this.checkProjectMembership(createTaskDto.projectId, createTaskDto.assignedTo);
    }

    // Create task
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy,
      status: createTaskDto.status || 'todo',
      priority: createTaskDto.priority || 'medium',
    });

    const savedTask = await this.taskRepository.save(task);

    // Log activity
    await this.logActivity(savedTask.id, createdBy, 'created', 'Task được tạo');

    return this.findOne(savedTask.id, createdBy);
  }

  async findAll(
    projectId: string,
    userId: string,
    filters?: { status?: string; assignedTo?: string }
  ): Promise<Task[]> {
    // Check if user is member of the project
    await this.checkProjectMembership(projectId, userId);

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('task.project_id = :projectId', { projectId })
      .orderBy('task.created_at', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters?.assignedTo) {
      queryBuilder.andWhere('task.assigned_to = :assignedTo', { assignedTo: filters.assignedTo });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'creator', 'project'],
    });

    if (!task) {
      throw new NotFoundException('Không tìm thấy task');
    }

    // Check if user is member of the project
    await this.checkProjectMembership(task.projectId, userId);

    return task;
  }

  async findTaskByIdOrCode(idOrCode: string, userId: string): Promise<Task> {
    let task: Task | null = null;

    // Try to find by UUID first
    if (idOrCode.length === 36 && idOrCode.includes('-')) {
      task = await this.taskRepository.findOne({
        where: { id: idOrCode },
        relations: ['assignee', 'creator', 'project'],
      });
    }

    // If not found by UUID, try to find by title (since we don't have code field)
    if (!task) {
      task = await this.taskRepository.findOne({
        where: { title: idOrCode },
        relations: ['assignee', 'creator', 'project'],
      });
    }

    // If still not found, try partial title match
    if (!task) {
      task = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignee', 'assignee')
        .leftJoinAndSelect('task.creator', 'creator')
        .leftJoinAndSelect('task.project', 'project')
        .where('task.title ILIKE :title', { title: `%${idOrCode}%` })
        .getOne();
    }

    if (!task) {
      throw new NotFoundException('Không tìm thấy task');
    }

    // Check if user is member of the project
    await this.checkProjectMembership(task.projectId, userId);

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Check permissions - only creator, assignee, or PM can update
    const canUpdate = await this.canModifyTask(task, userId);
    if (!canUpdate) {
      throw new ForbiddenException('Không có quyền cập nhật task này');
    }

    // Store old values for activity log
    const oldValues = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
    };

    // Update task
    Object.assign(task, updateTaskDto);
    const updatedTask = await this.taskRepository.save(task);

    // Log activity with changes
    const changes = this.getChanges(oldValues, updateTaskDto);
    if (changes.length > 0) {
      const description = `Task được cập nhật: ${changes.join(', ')}`;
      await this.logActivity(id, userId, 'updated', description, {
        changes: changes,
        note: updateTaskDto.changeNote,
      });
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);

    // Check permissions - only creator or PM can delete
    const member = await this.memberRepository.findOne({
      where: { projectId: task.projectId, userId, isActive: true },
    });

    if (!member || (task.createdBy !== userId && member.role !== 'PM')) {
      throw new ForbiddenException('Không có quyền xóa task này');
    }

    // Log activity before deletion
    await this.logActivity(id, userId, 'deleted', 'Task được xóa');

    await this.taskRepository.remove(task);
  }

  async moveTask(id: string, moveTaskDto: MoveTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Check permissions
    const canUpdate = await this.canModifyTask(task, userId);
    if (!canUpdate) {
      throw new ForbiddenException('Không có quyền di chuyển task này');
    }

    const oldStatus = task.status;
    task.status = moveTaskDto.newStatus;

    const updatedTask = await this.taskRepository.save(task);

    // Log activity
    await this.logActivity(id, userId, 'status_changed', 
      `Task được chuyển từ "${oldStatus}" sang "${moveTaskDto.newStatus}"`, {
        oldStatus,
        newStatus: moveTaskDto.newStatus,
        note: moveTaskDto.note,
      });

    return this.findOne(id, userId);
  }

  async assignTask(id: string, assigneeId: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Check if assignee is project member
    await this.checkProjectMembership(task.projectId, assigneeId);

    // Check permissions - only PM or creator can assign
    const member = await this.memberRepository.findOne({
      where: { projectId: task.projectId, userId, isActive: true },
    });

    if (!member || (task.createdBy !== userId && member.role !== 'PM')) {
      throw new ForbiddenException('Không có quyền assign task này');
    }

    const oldAssignee = task.assignedTo;
    task.assignedTo = assigneeId;

    const updatedTask = await this.taskRepository.save(task);

    // Log activity
    const action = oldAssignee ? 'assigned' : 'assigned';
    const description = oldAssignee 
      ? `Task được chuyển assign từ user khác sang user mới`
      : `Task được assign cho user`;

    await this.logActivity(id, userId, action, description, {
      oldAssignee,
      newAssignee: assigneeId,
    });

    return this.findOne(id, userId);
  }

  async getTaskActivities(id: string, userId: string): Promise<TaskActivity[]> {
    const task = await this.findOne(id, userId);

    return this.activityRepository.find({
      where: { taskId: id },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Helper methods
  private async checkProjectMembership(projectId: string, userId: string): Promise<ProjectMember> {
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('Bạn không phải là thành viên của dự án này');
    }

    return member;
  }

  private async canModifyTask(task: Task, userId: string): Promise<boolean> {
    // Creator can always modify
    if (task.createdBy === userId) return true;

    // Assignee can modify
    if (task.assignedTo === userId) return true;

    // PM can modify
    const member = await this.memberRepository.findOne({
      where: { projectId: task.projectId, userId, isActive: true },
    });

    return member?.role === 'PM';
  }

  private async logActivity(
    taskId: string,
    userId: string,
    action: TaskActivity['action'],
    description: string,
    metadata?: any
  ): Promise<void> {
    const activity = this.activityRepository.create({
      taskId,
      userId,
      action,
      description,
      metadata,
    });

    await this.activityRepository.save(activity);
  }

  private getChanges(oldValues: any, newValues: any): string[] {
    const changes: string[] = [];

    Object.keys(newValues).forEach(key => {
      if (key === 'changeNote') return; // Skip change note
      
      if (oldValues[key] !== newValues[key] && newValues[key] !== undefined) {
        changes.push(`${key}: "${oldValues[key]}" → "${newValues[key]}"`);
      }
    });

    return changes;
  }
}
