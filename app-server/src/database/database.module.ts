import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { SystemInitializationService } from './system-initialization.service';
import { SystemInitializationController } from './system-initialization.controller';
import { SeedGroupsUsersService } from './seed-groups-users.service';
import { User, Group, Permission, Menu, ActivityLog } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { MenusModule } from '../menus/menus.module';
import { CollabModule } from '../collab/collab.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Group, Permission, Menu, ActivityLog]),
    AuthModule,
    PermissionsModule,
    MenusModule,
    CollabModule,
  ],
  controllers: [SeedingController, SystemInitializationController],
  providers: [SeedingService, SystemInitializationService, SeedGroupsUsersService],
  exports: [SeedingService, SystemInitializationService],
})
export class DatabaseModule {}
