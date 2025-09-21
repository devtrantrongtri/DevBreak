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
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AssignPermissionsDto, UpsertGroupUsersDto } from './dto/assign-permissions.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @RequirePermissions('groups.create')
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'The group has been successfully created.' })
  @ApiResponse({ status: 409, description: 'Group code already exists.' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @RequirePermissions('groups.view')
  @ApiOperation({ summary: 'Get all groups' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('groups.view')
  @ApiOperation({ summary: 'Get a group by ID' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('groups.edit')
  @ApiOperation({ summary: 'Update a group' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('groups.delete')
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({ status: 204, description: 'The group has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupsService.remove(id);
  }

  @Post(':id/permissions')
  @RequirePermissions('groups.manage_permissions')
  @ApiOperation({ summary: 'Assign permissions to a group' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully.' })
  @ApiResponse({ status: 404, description: 'Group or permissions not found.' })
  assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.groupsService.assignPermissions(id, assignPermissionsDto);
  }

  @Post(':id/users')
  @RequirePermissions('groups.manage_members')
  @ApiOperation({ summary: 'Add or remove users from a group' })
  @ApiResponse({ status: 200, description: 'Users updated successfully.' })
  @ApiResponse({ status: 404, description: 'Group or users not found.' })
  manageUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() upsertGroupUsersDto: UpsertGroupUsersDto,
  ) {
    return this.groupsService.manageUsers(id, upsertGroupUsersDto);
  }
}
