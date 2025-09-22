import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto, UpdateMemberRoleDto } from './dto/manage-members.dto';
import { UpdateComponentVisibilityDto, ResetComponentVisibilityDto } from './dto/component-visibility.dto';

@ApiTags('Collab - Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('collab/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @RequirePermissions('collab.projects.create')
  @ApiOperation({ summary: 'Tạo dự án mới' })
  @ApiResponse({ status: 201, description: 'Dự án được tạo thành công' })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  @RequirePermissions('collab.projects.view')
  @ApiOperation({ summary: 'Lấy danh sách dự án user là thành viên' })
  @ApiResponse({ status: 200, description: 'Danh sách dự án' })
  findAll(@Request() req: any) {
    return this.projectsService.findAll(req.user.userId);
  }

  @Get(':id')
  @RequirePermissions('collab.projects.view')
  @ApiOperation({ summary: 'Lấy chi tiết dự án' })
  @ApiResponse({ status: 200, description: 'Chi tiết dự án' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('collab.projects.update')
  @ApiOperation({ summary: 'Cập nhật thông tin dự án' })
  @ApiResponse({ status: 200, description: 'Dự án được cập nhật thành công' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.userId);
  }

  @Delete(':id')
  @RequirePermissions('collab.projects.delete')
  @ApiOperation({ summary: 'Xóa dự án' })
  @ApiResponse({ status: 200, description: 'Dự án được xóa thành công' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.userId);
  }

  // Members management
  @Get(':id/members')
  @RequirePermissions('collab.projects.view')
  @ApiOperation({ summary: 'Lấy danh sách thành viên dự án' })
  @ApiResponse({ status: 200, description: 'Danh sách thành viên' })
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getMembers(id);
  }

  @Post(':id/members')
  @RequirePermissions('collab.projects.manage_members')
  @ApiOperation({ summary: 'Thêm thành viên vào dự án' })
  @ApiResponse({ status: 201, description: 'Thành viên được thêm thành công' })
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.projectsService.addMember(id, addMemberDto);
  }

  @Patch(':id/members/:userId')
  @RequirePermissions('collab.projects.manage_members')
  @ApiOperation({ summary: 'Cập nhật vai trò thành viên' })
  @ApiResponse({ status: 200, description: 'Vai trò được cập nhật thành công' })
  updateMemberRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @Request() req,
  ) {
    return this.projectsService.updateMemberRole(id, userId, updateMemberRoleDto, req.user.userId);
  }

  @Delete(':id/members/:userId')
  @RequirePermissions('collab.projects.manage_members')
  @ApiOperation({ summary: 'Xóa thành viên khỏi dự án' })
  @ApiResponse({ status: 200, description: 'Thành viên được xóa thành công' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req,
  ) {
    return this.projectsService.removeMember(id, userId, req.user.userId);
  }

  // Component Visibility Routes
  @Post(':id/component-visibility')
  @RequirePermissions('collab.projects.view')
  @ApiOperation({
    summary: '🎛️ Update component visibility settings (PM only)',
    description: `
    **Update visibility settings for a specific component in a project.**

    **PM Only**: Only Project Managers can modify component visibility.

    **Examples:**
    - Make component visible to all: \`{ "componentKey": "daily-reports", "isVisibleToAll": true }\`
    - Restrict to PM only: \`{ "componentKey": "task-board", "isVisibleToAll": false, "visibleRoles": ["PM"] }\`
    - Restrict to management: \`{ "componentKey": "summary", "isVisibleToAll": false, "visibleRoles": ["PM", "BC"] }\`
    `
  })
  @ApiResponse({
    status: 200,
    description: '✅ Component visibility updated successfully',
    schema: {
      example: {
        id: "uuid-here",
        projectId: "project-uuid",
        componentKey: "daily-reports",
        isVisibleToAll: false,
        visibleRoles: ["PM", "BC"],
        createdAt: "2025-09-21T23:30:00Z",
        updatedAt: "2025-09-21T23:30:00Z"
      }
    }
  })
  @ApiResponse({ status: 403, description: '❌ Only PM can update component visibility' })
  @ApiResponse({ status: 404, description: '❌ Project not found or user not a member' })
  updateComponentVisibility(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateComponentVisibilityDto: UpdateComponentVisibilityDto,
    @Request() req: any,
  ) {
    return this.projectsService.updateComponentVisibility(id, updateComponentVisibilityDto, req.user.userId);
  }

  @Delete(':id/component-visibility')
  @RequirePermissions('collab.projects.view')
  @ApiOperation({ summary: 'Reset component visibility to default (PM only)' })
  @ApiResponse({ status: 200, description: 'Component visibility reset successfully' })
  resetComponentVisibility(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resetComponentVisibilityDto: ResetComponentVisibilityDto,
    @Request() req: any,
  ) {
    return this.projectsService.resetComponentVisibility(id, resetComponentVisibilityDto, req.user.userId);
  }

  @Get(':id/component-visibility')
  @RequirePermissions('collab.projects.view')
  @ApiOperation({ summary: 'Get component visibility settings' })
  @ApiResponse({ status: 200, description: 'Component visibility settings retrieved' })
  getComponentVisibility(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.projectsService.getComponentVisibility(id, req.user.userId);
  }

  // Admin route to get all projects
  @Get('admin/all')
  @RequirePermissions('collab.projects.view_all')
  @ApiOperation({ summary: 'Get all projects (Admin only)' })
  @ApiResponse({ status: 200, description: 'All projects retrieved' })
  findAllForAdmin(@Request() req: any) {
    return this.projectsService.findAllForAdmin(req.user.userId);
  }

  // Add global component to project
  @Post(':id/add-component')
  @RequirePermissions('collab.projects.view')
  @ApiOperation({
    summary: '➕ Add global component to project (PM only)',
    description: `
    **Add an existing global component to a project with optional visibility overrides.**

    **PM Only**: Only Project Managers can add components to projects.

    **Workflow:**
    1. Use \`GET /collab/components\` to see available global components
    2. Use this endpoint to add selected component to project
    3. Optionally override default visibility settings

    **Examples:**
    - Add with defaults: \`{ "componentId": "uuid-here" }\`
    - Override visibility: \`{ "componentId": "uuid-here", "isVisibleToAll": false, "visibleRoles": ["PM"] }\`
    `
  })
  @ApiResponse({
    status: 201,
    description: '✅ Component added to project successfully',
    schema: {
      example: {
        id: "uuid-here",
        projectId: "project-uuid",
        componentKey: "team-performance",
        isVisibleToAll: false,
        visibleRoles: ["PM", "BC"],
        createdAt: "2025-09-21T23:30:00Z",
        updatedAt: "2025-09-21T23:30:00Z"
      }
    }
  })
  @ApiResponse({ status: 400, description: '❌ Component already added or invalid data' })
  @ApiResponse({ status: 403, description: '❌ Only PM can add components' })
  @ApiResponse({ status: 404, description: '❌ Component or project not found' })
  addGlobalComponentToProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addComponentDto: { componentId: string; isVisibleToAll?: boolean; visibleRoles?: string[] },
    @Request() req: any,
  ) {
    return this.projectsService.addGlobalComponentToProject(
      id,
      addComponentDto.componentId,
      req.user.userId,
      {
        isVisibleToAll: addComponentDto.isVisibleToAll,
        visibleRoles: addComponentDto.visibleRoles
      }
    );
  }
}
