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
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto, UpdateMenuNameDto, RebindMenuPermissionDto } from './dto/update-menu.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @RequirePermissions('system.manage', 'system.menus.manage')
  @ApiOperation({ summary: 'Create a new menu' })
  @ApiResponse({ status: 201, description: 'The menu has been successfully created.' })
  @ApiResponse({ status: 409, description: 'Menu path already exists.' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @RequirePermissions('system.manage', 'system.menus.manage')
  @ApiOperation({ summary: 'Get all menus' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get('tree')
  @RequirePermissions('system.manage', 'system.menus.manage')
  @ApiOperation({ summary: 'Get menu tree structure' })
  findTree() {
    return this.menusService.findTree();
  }

  @Get(':id')
  @RequirePermissions('system.manage', 'system.menus.manage')
  @ApiOperation({ summary: 'Get a menu by ID' })
  @ApiResponse({ status: 404, description: 'Menu not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('system.manage', 'system.menus.manage')
  @ApiOperation({ summary: 'Update a menu' })
  @ApiResponse({ status: 404, description: 'Menu not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Patch(':id/name')
  @RequirePermissions('system.manage', 'system.menus.manage', 'menu.updateName')
  @ApiOperation({ summary: 'Update menu name' })
  @ApiResponse({ status: 200, description: 'Menu name updated successfully.' })
  @ApiResponse({ status: 404, description: 'Menu not found.' })
  updateName(@Param('id', ParseUUIDPipe) id: string, @Body() updateMenuNameDto: UpdateMenuNameDto) {
    return this.menusService.updateName(id, updateMenuNameDto);
  }

  @Patch(':id/permission')
  @RequirePermissions('system.manage', 'system.menus.manage', 'menu.rebindPermission')
  @ApiOperation({ summary: 'Rebind menu permission' })
  @ApiResponse({ status: 200, description: 'Menu permission rebound successfully.' })
  @ApiResponse({ status: 404, description: 'Menu or permission not found.' })
  rebindPermission(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() rebindMenuPermissionDto: RebindMenuPermissionDto
  ) {
    return this.menusService.rebindPermission(id, rebindMenuPermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('system.manage', 'system.menus.manage')
  @ApiOperation({ summary: 'Delete a menu' })
  @ApiResponse({ status: 204, description: 'The menu has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Menu not found.' })
  @ApiResponse({ status: 409, description: 'Cannot delete menu with children.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.remove(id);
  }

  @Post('seed')
  @RequirePermissions('system.manage') // Only super admin can seed menus
  @ApiOperation({ summary: 'Seed initial menu structure' })
  @ApiResponse({ status: 200, description: 'Menus seeded successfully.' })
  async seedMenus() {
    await this.menusService.seedMenus();
    return { message: 'Menus seeded successfully' };
  }
}
