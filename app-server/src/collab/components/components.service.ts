import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Component } from './entities/component.entity';
import { ProjectComponentVisibility } from '../projects/entities/project-component-visibility.entity';
import { CreateComponentDto, UpdateComponentDto, AddComponentToProjectDto } from './dto/component.dto';

@Injectable()
export class ComponentsService {
  constructor(
    @InjectRepository(Component)
    private componentRepository: Repository<Component>,
    @InjectRepository(ProjectComponentVisibility)
    private visibilityRepository: Repository<ProjectComponentVisibility>,
  ) {}

  // Create new global component
  async create(createComponentDto: CreateComponentDto, userId: string): Promise<Component> {
    // Check if component key already exists
    const existingComponent = await this.componentRepository.findOne({
      where: { key: createComponentDto.key },
    });

    if (existingComponent) {
      throw new BadRequestException(`Component with key '${createComponentDto.key}' already exists`);
    }

    const component = this.componentRepository.create({
      ...createComponentDto,
      createdBy: userId,
    });

    return this.componentRepository.save(component);
  }

  // Get all components (with filters)
  async findAll(filters?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Component[]> {
    const query = this.componentRepository.createQueryBuilder('component');

    if (filters?.category) {
      query.andWhere('component.category = :category', { category: filters.category });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('component.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.search) {
      query.andWhere(
        '(component.name ILIKE :search OR component.description ILIKE :search OR component.key ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return query
      .orderBy('component.category', 'ASC')
      .addOrderBy('component.name', 'ASC')
      .getMany();
  }

  // Get component by ID
  async findOne(id: string): Promise<Component> {
    const component = await this.componentRepository.findOne({
      where: { id },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    return component;
  }

  // Get component by key
  async findByKey(key: string): Promise<Component> {
    const component = await this.componentRepository.findOne({
      where: { key },
    });

    if (!component) {
      throw new NotFoundException(`Component with key '${key}' not found`);
    }

    return component;
  }

  // Update component
  async update(id: string, updateComponentDto: UpdateComponentDto, userId: string): Promise<Component> {
    const component = await this.findOne(id);

    // Check if user can update (only creator or admin)
    // TODO: Add proper permission check here
    
    Object.assign(component, updateComponentDto);
    return this.componentRepository.save(component);
  }

  // Delete component (only if not built-in and not used in projects)
  async remove(id: string, userId: string): Promise<void> {
    const component = await this.findOne(id);

    if (component.isBuiltIn) {
      throw new ForbiddenException('Cannot delete built-in components');
    }

    // Check if component is used in any projects
    const usageCount = await this.visibilityRepository.count({
      where: { componentKey: component.key },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        `Cannot delete component '${component.key}' as it is used in ${usageCount} project(s)`
      );
    }

    await this.componentRepository.remove(component);
  }

  // Add component to project with custom visibility
  async addToProject(
    projectId: string,
    addComponentDto: AddComponentToProjectDto,
    userId: string
  ): Promise<ProjectComponentVisibility> {
    const component = await this.findOne(addComponentDto.componentId);

    // Check if component already added to project
    const existingVisibility = await this.visibilityRepository.findOne({
      where: { projectId, componentKey: component.key },
    });

    if (existingVisibility) {
      throw new BadRequestException(`Component '${component.key}' already added to this project`);
    }

    // Use override settings or component defaults
    const isVisibleToAll = addComponentDto.isVisibleToAll ?? (component.defaultRoles === null);
    const visibleRoles = addComponentDto.visibleRoles ?? component.defaultRoles;

    const visibility = this.visibilityRepository.create({
      projectId,
      componentKey: component.key,
      isVisibleToAll,
      visibleRoles,
    });

    return this.visibilityRepository.save(visibility);
  }

  // Get components by category
  async findByCategory(category: string): Promise<Component[]> {
    return this.componentRepository.find({
      where: { category, isActive: true },
      order: { name: 'ASC' },
    });
  }

  // Get all categories
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const result = await this.componentRepository
      .createQueryBuilder('component')
      .select('component.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('component.isActive = :isActive', { isActive: true })
      .groupBy('component.category')
      .orderBy('component.category', 'ASC')
      .getRawMany();

    return result.map(row => ({
      category: row.category,
      count: parseInt(row.count, 10),
    }));
  }

  // Seed built-in components
  async seedBuiltInComponents(): Promise<void> {
    const builtInComponents = [
      {
        key: 'daily-reports',
        name: 'Daily Reports',
        description: 'Team daily standup reports and progress tracking',
        category: 'communication',
        defaultRoles: null,
        isBuiltIn: true,
      },
      {
        key: 'task-board',
        name: 'Task Board',
        description: 'Kanban-style task management board',
        category: 'management',
        defaultRoles: null,
        isBuiltIn: true,
      },
      {
        key: 'summary',
        name: 'Project Summary',
        description: 'Project overview, metrics, and key indicators',
        category: 'dashboard',
        defaultRoles: ['PM', 'BC'],
        isBuiltIn: true,
      },
      {
        key: 'team-performance',
        name: 'Team Performance',
        description: 'Team productivity analytics and performance metrics',
        category: 'analytics',
        defaultRoles: ['PM'],
        isBuiltIn: true,
      },
      {
        key: 'project-timeline',
        name: 'Project Timeline',
        description: 'Project milestones, deadlines, and timeline visualization',
        category: 'management',
        defaultRoles: ['PM', 'BC'],
        isBuiltIn: true,
      },
    ];

    for (const componentData of builtInComponents) {
      const existing = await this.componentRepository.findOne({
        where: { key: componentData.key },
      });

      if (!existing) {
        const component = this.componentRepository.create({
          ...componentData,
          createdBy: null, // System created
        });
        await this.componentRepository.save(component);
      }
    }
  }
}
