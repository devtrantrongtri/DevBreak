import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailiesService } from './dailies.service';
import { DailiesController } from './dailies.controller';
import { Daily } from './entities/daily.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Daily, ProjectMember]),
    AuthModule,
  ],
  controllers: [DailiesController],
  providers: [DailiesService],
  exports: [DailiesService],
})
export class DailiesModule {}
