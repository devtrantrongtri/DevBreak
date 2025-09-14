import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SeedingService } from './seeding.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Database Seeding')
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('seed')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post()
  // @RequirePermissions('system.manage') // Only super admin can seed
  @ApiOperation({ summary: 'Seed database with initial data (DEBUG - no auth)' })
  @ApiResponse({ status: 200, description: 'Database seeded successfully.' })
  async seedDatabase() {
    await this.seedingService.seedAll();
    return { message: 'Database seeded successfully' };
  }

  @Get('debug')
  @ApiOperation({ summary: 'Debug database state' })
  async debugDatabase() {
    return await this.seedingService.debugDatabaseState();
  }
}
