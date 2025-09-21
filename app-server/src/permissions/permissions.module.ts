import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryModule } from '@nestjs/core';
import { PermissionsService } from './permissions.service';
import { PermissionDiscoveryService } from './permission-discovery.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from '../entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    DiscoveryModule,
    AuthModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionDiscoveryService],
  exports: [PermissionsService, PermissionDiscoveryService],
})
export class PermissionsModule {}
