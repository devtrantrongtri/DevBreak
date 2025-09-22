import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../entities/User';
import { Project } from '../../projects/entities/project.entity';
import { TaskActivity } from './task-activity.entity';

@Entity('tasks')
@Index(['projectId'])
@Index(['status'])
@Index(['assignedTo'])
@Index(['priority'])
@Index(['dueDate'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({
    type: 'enum',
    enum: ['todo', 'in_process', 'ready_for_qc', 'done'],
    default: 'todo',
  })
  status: 'todo' | 'in_process' | 'ready_for_qc' | 'done';

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ type: 'date', name: 'due_date', nullable: true })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'estimated_hours', nullable: true })
  estimatedHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'actual_hours', nullable: true, default: 0 })
  actualHours: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Project, { eager: false })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => TaskActivity, (activity) => activity.task, { cascade: true })
  activities: TaskActivity[];
}
