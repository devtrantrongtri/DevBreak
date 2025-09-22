import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_component_visibility')
@Index(['projectId'])
@Index(['componentKey'])
@Unique(['projectId', 'componentKey']) // One setting per component per project
export class ProjectComponentVisibility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'component_key', length: 100 })
  componentKey: string; // e.g., 'daily-reports', 'task-board', 'summary'

  @Column({ type: 'json', nullable: true })
  visibleRoles: string[] | null; // ['PM', 'BC'] or null for all

  @Column({ name: 'is_visible_to_all', default: true })
  isVisibleToAll: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Project, { eager: false })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
