import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignGroupsDto } from './dto/assign-groups.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('system.manage', 'system.users.manage', 'user.create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @RequirePermissions('system.manage', 'system.users.manage', 'user.read')
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('system.manage', 'system.users.manage', 'user.read')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('system.manage', 'system.users.manage', 'user.update')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('system.manage', 'system.users.manage', 'user.delete')
  @ApiOperation({ summary: 'Delete a user (soft delete)' })
  @ApiResponse({ status: 204, description: 'The user has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/groups')
  @RequirePermissions('system.manage', 'system.users.manage', 'group.update')
  @ApiOperation({ summary: 'Assign groups to a user' })
  @ApiResponse({ status: 200, description: 'Groups assigned successfully.' })
  @ApiResponse({ status: 404, description: 'User or groups not found.' })
  assignGroups(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignGroupsDto: AssignGroupsDto,
  ) {
    return this.usersService.assignGroups(id, assignGroupsDto.groupIds);
  }
}
