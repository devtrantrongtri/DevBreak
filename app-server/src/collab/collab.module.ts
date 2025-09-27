import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { DailiesModule } from './dailies/dailies.module';
import { ComponentsModule } from './components/components.module';
import { CollabPermissionsService } from './seed-collab-permissions';
import { Permission } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    ProjectsModule, 
    TasksModule, 
    DailiesModule, 
    ComponentsModule
  ],
  providers: [CollabPermissionsService],
  exports: [ProjectsModule, TasksModule, DailiesModule, ComponentsModule, CollabPermissionsService],
})
export class CollabModule {}
