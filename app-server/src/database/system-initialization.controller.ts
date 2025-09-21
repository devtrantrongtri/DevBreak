import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SystemInitializationService } from './system-initialization.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('System Initialization')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('system')
export class SystemInitializationController {
  constructor(
    private readonly systemInitializationService: SystemInitializationService,
  ) {}

  @Get('info')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Get system information' })
  @ApiResponse({ status: 200, description: 'System information retrieved successfully.' })
  async getSystemInfo() {
    return this.systemInitializationService.getSystemInfo();
  }

  @Post('initialize')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Initialize system (create admin group, user, permissions)' })
  @ApiResponse({ status: 200, description: 'System initialized successfully.' })
  async initializeSystem() {
    await this.systemInitializationService.initializeSystem();
    return { message: 'System initialized successfully' };
  }

  @Post('reset')
  @RequirePermissions('system.manage')
  @ApiOperation({ 
    summary: 'Reset entire system (DANGER: Deletes all data)', 
    description: 'This will delete all users, groups, permissions, and menus, then reinitialize the system. Use with extreme caution!' 
  })
  @ApiResponse({ status: 200, description: 'System reset successfully.' })
  async resetSystem() {
    await this.systemInitializationService.resetSystem();
    return { message: 'System reset and reinitialized successfully' };
  }
}
