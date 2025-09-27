import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SeedingService } from './database/seeding.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seedingService: SeedingService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
  
  @Post('seed')
  async seed() {
    try {
      await this.seedingService.seedAll();
      return { success: true, message: 'Database seeded successfully' };
    } catch (error) {
      return { success: false, message: error.message, error };
    }
  }
}
