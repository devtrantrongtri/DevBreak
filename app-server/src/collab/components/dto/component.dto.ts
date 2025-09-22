import { IsString, IsArray, IsBoolean, IsOptional, IsIn, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComponentDto {
  @ApiProperty({ 
    description: 'Unique component key (kebab-case recommended)',
    example: 'team-performance',
    examples: {
      'team-performance': { value: 'team-performance', description: 'Team performance analytics' },
      'budget-tracker': { value: 'budget-tracker', description: 'Project budget tracking' },
      'risk-management': { value: 'risk-management', description: 'Risk assessment dashboard' },
      'client-feedback': { value: 'client-feedback', description: 'Client feedback collection' }
    }
  })
  @IsString()
  key: string;

  @ApiProperty({ 
    description: 'Human-readable display name',
    example: 'Team Performance Dashboard',
    examples: {
      'team-performance': { value: 'Team Performance Dashboard', description: 'Analytics dashboard' },
      'budget-tracker': { value: 'Budget Tracker', description: 'Financial tracking' },
      'risk-management': { value: 'Risk Management', description: 'Risk assessment' }
    }
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Component description',
    example: 'Track team productivity metrics, velocity, and performance indicators',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Component category',
    example: 'analytics',
    enum: ['dashboard', 'analytics', 'management', 'reporting', 'communication'],
    examples: {
      'dashboard': { value: 'dashboard', description: 'General dashboard components' },
      'analytics': { value: 'analytics', description: 'Data analysis and metrics' },
      'management': { value: 'management', description: 'Project management tools' },
      'reporting': { value: 'reporting', description: 'Report generation' },
      'communication': { value: 'communication', description: 'Team communication tools' }
    }
  })
  @IsString()
  @IsIn(['dashboard', 'analytics', 'management', 'reporting', 'communication'])
  category: string;

  @ApiProperty({ 
    description: 'Component configuration schema (JSON)',
    example: { theme: 'light', showMetrics: true, refreshInterval: 30 },
    required: false
  })
  @IsOptional()
  @IsObject()
  configSchema?: Record<string, any>;

  @ApiProperty({ 
    description: 'Default roles that can see this component',
    example: ['PM', 'BC'],
    required: false,
    type: [String],
    enum: ['PM', 'BC', 'DEV', 'QC'],
    examples: {
      'all-roles': { value: null, description: 'Visible to all roles (default)' },
      'management': { value: ['PM', 'BC'], description: 'Management only' },
      'pm-only': { value: ['PM'], description: 'Project Manager only' }
    }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultRoles?: string[];
}

export class UpdateComponentDto {
  @ApiProperty({ 
    description: 'Component display name',
    example: 'Updated Team Performance Dashboard',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Component description',
    example: 'Enhanced team productivity metrics with new KPIs',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Component category',
    example: 'analytics',
    enum: ['dashboard', 'analytics', 'management', 'reporting', 'communication'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['dashboard', 'analytics', 'management', 'reporting', 'communication'])
  category?: string;

  @ApiProperty({ 
    description: 'Component configuration schema',
    example: { theme: 'dark', showMetrics: true, refreshInterval: 60 },
    required: false
  })
  @IsOptional()
  @IsObject()
  configSchema?: Record<string, any>;

  @ApiProperty({ 
    description: 'Default roles that can see this component',
    example: ['PM', 'BC', 'DEV'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultRoles?: string[];

  @ApiProperty({ 
    description: 'Whether component is active',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AddComponentToProjectDto {
  @ApiProperty({ 
    description: 'Component ID to add to project',
    example: 'uuid-here'
  })
  @IsString()
  componentId: string;

  @ApiProperty({ 
    description: 'Override default visibility (optional)',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isVisibleToAll?: boolean;

  @ApiProperty({ 
    description: 'Override default visible roles (optional)',
    example: ['PM'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visibleRoles?: string[];
}
