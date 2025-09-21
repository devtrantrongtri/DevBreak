import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PermissionDiscoveryService } from './permission-discovery.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly permissionDiscoveryService: PermissionDiscoveryService
  ) {}

  @Post()
  @RequirePermissions('permissions.create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'The permission has been successfully created.' })
  @ApiResponse({ status: 409, description: 'Permission code already exists.' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @RequirePermissions('permissions.view')
  @ApiOperation({ summary: 'Get all permissions' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('tree')
  @RequirePermissions('permissions.view')
  @ApiOperation({ summary: 'Get permissions organized as a tree' })
  getTree() {
    return this.permissionsService.getPermissionTree();
  }

  @Get(':id')
  @RequirePermissions('permissions.view')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('permissions.edit')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('permissions.delete')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 204, description: 'The permission has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.remove(id);
  }

  @Post('seed')
  @RequirePermissions('permissions.sync')
  @ApiOperation({ summary: 'Seed initial permissions' })
  @ApiResponse({ status: 200, description: 'Permissions seeded successfully.' })
  async seedPermissions() {
    await this.permissionsService.seedPermissions();
    return { message: 'Permissions seeded successfully' };
  }

  @Get('discover')
  @RequirePermissions('permissions.sync')
  @ApiOperation({ summary: 'Discover permissions from code' })
  @ApiResponse({ status: 200, description: 'Permissions discovered successfully.' })
  async discoverPermissions() {
    const discovered = await this.permissionDiscoveryService.discoverPermissions();
    return {
      message: 'Permissions discovered successfully',
      count: discovered.length,
      permissions: discovered
    };
  }

  @Post('sync')
  @RequirePermissions('permissions.sync')
  @ApiOperation({ summary: 'Sync discovered permissions with database' })
  @ApiResponse({ status: 200, description: 'Permissions synced successfully.' })
  async syncPermissions() {
    const result = await this.permissionDiscoveryService.syncPermissions();
    return {
      message: 'Permissions synced successfully',
      ...result
    };
  }

  @Get('modules')
  @RequirePermissions('permissions.view')
  @ApiOperation({ summary: 'Get permissions organized by modules' })
  @ApiResponse({ status: 200, description: 'Permission modules retrieved successfully.' })
  async getPermissionModules() {
    const modules = await this.permissionDiscoveryService.getPermissionsByModules();
    return {
      message: 'Permission modules retrieved successfully',
      modules
    };
  }

  @Post('cleanup')
  @RequirePermissions('permissions.delete')
  @ApiOperation({
    summary: 'Clean up unused permissions (dry run by default)',
    description: 'Remove permissions that are no longer used in code. Use ?dryRun=false to actually delete.'
  })
  @ApiResponse({ status: 200, description: 'Cleanup completed.' })
  async cleanupPermissions(@Body() body: { dryRun?: boolean } = {}) {
    const dryRun = body.dryRun !== false; // Default to true
    const removedCodes = await this.permissionDiscoveryService.cleanupUnusedPermissions(dryRun);
    return {
      message: dryRun ? 'Cleanup dry run completed' : 'Cleanup completed',
      dryRun,
      removedCount: removedCodes.length,
      removedPermissions: removedCodes
    };
  }
}
