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
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('system.manage') // Only super admin can create permissions
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'The permission has been successfully created.' })
  @ApiResponse({ status: 409, description: 'Permission code already exists.' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @RequirePermissions('system.manage', 'system.groups.manage') // Need group management to see permissions
  @ApiOperation({ summary: 'Get all permissions' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('tree')
  @RequirePermissions('system.manage', 'system.groups.manage')
  @ApiOperation({ summary: 'Get permissions organized as a tree' })
  getTree() {
    return this.permissionsService.getPermissionTree();
  }

  @Get(':id')
  @RequirePermissions('system.manage', 'system.groups.manage')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('system.manage') // Only super admin can update permissions
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('system.manage') // Only super admin can delete permissions
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 204, description: 'The permission has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.remove(id);
  }

  @Post('seed')
  @RequirePermissions('system.manage') // Only super admin can seed permissions
  @ApiOperation({ summary: 'Seed initial permissions' })
  @ApiResponse({ status: 200, description: 'Permissions seeded successfully.' })
  async seedPermissions() {
    await this.permissionsService.seedPermissions();
    return { message: 'Permissions seeded successfully' };
  }
}
