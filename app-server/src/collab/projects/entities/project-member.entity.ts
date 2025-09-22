import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../../entities/User';
import { Project } from './project.entity';

@Entity('project_members')
@Unique(['projectId', 'userId']) // Một user chỉ có 1 role/project
@Index(['projectId'])
@Index(['userId'])
@Index(['role'])
@Index(['isActive'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 20 })
  role: string; // PM, BC, DEV, QC

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Project, (project) => project.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods
  isPM(): boolean {
    return this.role === 'PM';
  }

  isBC(): boolean {
    return this.role === 'BC';
  }

  isDev(): boolean {
    return this.role === 'DEV';
  }

  isQC(): boolean {
    return this.role === 'QC';
  }

  canManageProject(): boolean {
    return this.isPM();
  }

  canCreateTasks(): boolean {
    return this.isPM() || this.isBC();
  }

  canAssignTasks(): boolean {
    return this.isPM();
  }

  canViewAllDailies(): boolean {
    return this.isPM();
  }
}
