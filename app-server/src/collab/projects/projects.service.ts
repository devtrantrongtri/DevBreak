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

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private memberRepository: Repository<ProjectMember>,
    @InjectRepository(ProjectComponentVisibility)
    private visibilityRepository: Repository<ProjectComponentVisibility>,
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
}
