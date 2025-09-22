import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ComponentsService } from './components.service';
import { CreateComponentDto, UpdateComponentDto, AddComponentToProjectDto } from './dto/component.dto';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('🧩 Global Components')
@ApiBearerAuth()
@Controller('collab/components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post()
  @RequirePermissions('collab.components.create')
  @ApiOperation({ 
    summary: '➕ Create new global component',
    description: `
    **Create a new global component that can be used across all projects.**
    
    **Component Key Guidelines:**
    - Use kebab-case (e.g., "team-performance", "budget-tracker")
    - Be descriptive and unique globally
    - Avoid spaces and special characters
    
    **Categories:**
    - \`dashboard\`: General dashboard components
    - \`analytics\`: Data analysis and metrics
    - \`management\`: Project management tools  
    - \`reporting\`: Report generation
    - \`communication\`: Team communication tools
    
    **Quick Examples:**
    - Team Performance: \`{ "key": "team-performance", "name": "Team Performance", "category": "analytics" }\`
    - Budget Tracker: \`{ "key": "budget-tracker", "name": "Budget Tracker", "category": "management", "defaultRoles": ["PM"] }\`
    `
  })
  @ApiResponse({ 
    status: 201, 
    description: '✅ Component created successfully',
    schema: {
      example: {
        id: "uuid-here",
        key: "team-performance",
        name: "Team Performance Dashboard",
        description: "Track team productivity metrics",
        category: "analytics",
        defaultRoles: ["PM", "BC"],
        isActive: true,
        isBuiltIn: false,
        createdBy: "user-uuid",
        createdAt: "2025-09-21T23:30:00Z"
      }
    }
  })
  @ApiResponse({ status: 400, description: '❌ Component key already exists or invalid data' })
  create(@Body() createComponentDto: CreateComponentDto, @Request() req: any) {
    return this.componentsService.create(createComponentDto, req.user.userId);
  }

  @Get()
  @RequirePermissions('collab.components.view')
  @ApiOperation({ 
    summary: '📋 Get all global components',
    description: `
    **Get list of all global components with optional filtering.**
    
    **Query Parameters:**
    - \`category\`: Filter by category (dashboard, analytics, management, etc.)
    - \`isActive\`: Filter by active status (true/false)
    - \`search\`: Search in name, description, or key
    
    **Use Cases:**
    - Frontend component picker/dropdown
    - Admin component management
    - Project setup wizards
    `
  })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name, description, or key' })
  @ApiResponse({ 
    status: 200, 
    description: '✅ Components retrieved successfully',
    schema: {
      example: [
        {
          id: "uuid-1",
          key: "daily-reports",
          name: "Daily Reports",
          description: "Team daily standup reports",
          category: "communication",
          defaultRoles: null,
          isActive: true,
          isBuiltIn: true
        },
        {
          id: "uuid-2", 
          key: "team-performance",
          name: "Team Performance",
          description: "Team productivity analytics",
          category: "analytics",
          defaultRoles: ["PM"],
          isActive: true,
          isBuiltIn: false
        }
      ]
    }
  })
  findAll(
    @Query('category') category?: string,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ) {
    return this.componentsService.findAll({ category, isActive, search });
  }

  @Get('categories')
  @RequirePermissions('collab.components.view')
  @ApiOperation({ 
    summary: '📊 Get component categories with counts',
    description: `
    **Get all component categories with component counts.**
    
    **Returns:** Array of categories with counts for building UI filters/navigation.
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: '✅ Categories retrieved successfully',
    schema: {
      example: [
        { category: "analytics", count: 3 },
        { category: "communication", count: 2 },
        { category: "dashboard", count: 5 },
        { category: "management", count: 4 },
        { category: "reporting", count: 1 }
      ]
    }
  })
  getCategories() {
    return this.componentsService.getCategories();
  }

  @Get(':id')
  @RequirePermissions('collab.components.view')
  @ApiOperation({ 
    summary: '🔍 Get component by ID',
    description: 'Get detailed information about a specific component.'
  })
  @ApiResponse({ status: 200, description: '✅ Component found' })
  @ApiResponse({ status: 404, description: '❌ Component not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.componentsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('collab.components.update')
  @ApiOperation({ 
    summary: '✏️ Update global component',
    description: `
    **Update an existing global component.**
    
    **Note:** Built-in components may have restrictions on what can be updated.
    Changes will affect all projects using this component.
    `
  })
  @ApiResponse({ status: 200, description: '✅ Component updated successfully' })
  @ApiResponse({ status: 404, description: '❌ Component not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateComponentDto: UpdateComponentDto,
    @Request() req: any,
  ) {
    return this.componentsService.update(id, updateComponentDto, req.user.userId);
  }

  @Delete(':id')
  @RequirePermissions('collab.components.delete')
  @ApiOperation({ 
    summary: '🗑️ Delete global component',
    description: `
    **Delete a global component.**
    
    **Restrictions:**
    - Cannot delete built-in components
    - Cannot delete components currently used in projects
    - This action is irreversible
    `
  })
  @ApiResponse({ status: 200, description: '✅ Component deleted successfully' })
  @ApiResponse({ status: 400, description: '❌ Component is built-in or in use' })
  @ApiResponse({ status: 404, description: '❌ Component not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.componentsService.remove(id, req.user.userId);
  }

  @Post('seed')
  @RequirePermissions('collab.components.create')
  @ApiOperation({ 
    summary: '🌱 Seed built-in components',
    description: `
    **Create built-in components if they don't exist.**
    
    **Built-in Components:**
    - Daily Reports (communication)
    - Task Board (management)  
    - Project Summary (dashboard)
    - Team Performance (analytics)
    - Project Timeline (management)
    
    **Safe to run multiple times** - will not create duplicates.
    `
  })
  @ApiResponse({ status: 200, description: '✅ Built-in components seeded successfully' })
  seedBuiltInComponents() {
    return this.componentsService.seedBuiltInComponents();
  }
}
