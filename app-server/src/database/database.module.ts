import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { SystemInitializationService } from './system-initialization.service';
import { SystemInitializationController } from './system-initialization.controller';
import { User, Group, Permission, Menu, ActivityLog } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Group, Permission, Menu, ActivityLog]),
    AuthModule,
    PermissionsModule,
  ],
  controllers: [SeedingController, SystemInitializationController],
  providers: [SeedingService, SystemInitializationService],
  exports: [SeedingService, SystemInitializationService],
})
export class DatabaseModule {}
