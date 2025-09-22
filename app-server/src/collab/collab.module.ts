import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { DailiesModule } from './dailies/dailies.module';
import { ComponentsModule } from './components/components.module';

@Module({
  imports: [ProjectsModule, TasksModule, DailiesModule, ComponentsModule],
  exports: [ProjectsModule, TasksModule, DailiesModule, ComponentsModule],
})
export class CollabModule {}
