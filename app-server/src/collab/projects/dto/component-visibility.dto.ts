import { IsString, IsArray, IsBoolean, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateComponentVisibilityDto {
  @ApiProperty({
    description: 'Component key to update visibility for',
    example: 'daily-reports',
    enum: ['daily-reports', 'task-board', 'summary', 'team-performance', 'project-timeline'],
    examples: {
      'daily-reports': { value: 'daily-reports', description: 'Daily standup reports component' },
      'task-board': { value: 'task-board', description: 'Kanban task management board' },
      'summary': { value: 'summary', description: 'Project overview and metrics' },
      'team-performance': { value: 'team-performance', description: 'Team performance analytics' },
      'project-timeline': { value: 'project-timeline', description: 'Project milestones and timeline' }
    }
  })
  @IsString()
  @IsIn(['daily-reports', 'task-board', 'summary', 'team-performance', 'project-timeline'], { message: 'Invalid component key' })
  componentKey: string;

  @ApiProperty({
    description: 'Specific roles that can see this component (only used when isVisibleToAll is false)',
    example: ['PM', 'BC'],
    required: false,
    type: [String],
    enum: ['PM', 'BC', 'DEV', 'QC'],
    examples: {
      'pm-only': { value: ['PM'], description: 'Only Project Manager can see' },
      'pm-bc': { value: ['PM', 'BC'], description: 'PM and Business Consultant can see' },
      'all-roles': { value: ['PM', 'BC', 'DEV', 'QC'], description: 'All roles can see' }
    }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visibleRoles?: string[];

  @ApiProperty({
    description: 'Whether component is visible to all roles (true) or only specific roles (false)',
    example: true,
    examples: {
      'visible-to-all': { value: true, description: 'Component visible to all project members' },
      'restricted': { value: false, description: 'Component visible only to specified roles' }
    }
  })
  @IsBoolean()
  isVisibleToAll: boolean;
}

export class ResetComponentVisibilityDto {
  @ApiProperty({ description: 'Component key to reset', example: 'daily-reports' })
  @IsString()
  @IsIn(['daily-reports', 'task-board', 'summary', 'team-performance', 'project-timeline'], { message: 'Invalid component key' })
  componentKey: string;
}

export class AddComponentDto {
  @ApiProperty({
    description: 'Unique component key (kebab-case recommended)',
    example: 'team-performance',
    examples: {
      'team-performance': { value: 'team-performance', description: 'Team performance analytics dashboard' },
      'project-timeline': { value: 'project-timeline', description: 'Project milestones and timeline view' },
      'budget-tracker': { value: 'budget-tracker', description: 'Project budget tracking component' },
      'risk-management': { value: 'risk-management', description: 'Risk assessment and management' }
    }
  })
  @IsString()
  componentKey: string;

  @ApiProperty({
    description: 'Human-readable display name for the component',
    example: 'Team Performance Dashboard',
    examples: {
      'team-performance': { value: 'Team Performance Dashboard', description: 'Display name for team performance component' },
      'project-timeline': { value: 'Project Timeline', description: 'Display name for timeline component' },
      'budget-tracker': { value: 'Budget Tracker', description: 'Display name for budget component' }
    }
  })
  @IsString()
  displayName: string;

  @ApiProperty({
    description: 'Optional description explaining what this component does',
    example: 'Track team productivity metrics, velocity, and performance indicators',
    required: false,
    examples: {
      'detailed': { value: 'Track team productivity metrics, velocity, and performance indicators', description: 'Detailed description' },
      'simple': { value: 'Team performance analytics', description: 'Simple description' }
    }
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Default roles that can see this component when created (leave empty for visible to all)',
    example: ['PM', 'BC'],
    required: false,
    type: [String],
    enum: ['PM', 'BC', 'DEV', 'QC'],
    examples: {
      'pm-only': { value: ['PM'], description: 'Only PM can see initially' },
      'management': { value: ['PM', 'BC'], description: 'Management roles only' },
      'all-empty': { value: [], description: 'Visible to all roles (default)' }
    }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultRoles?: string[];
}
