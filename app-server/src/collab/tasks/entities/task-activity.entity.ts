import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../entities/User';
import { Task } from './task.entity';

@Entity('task_activities')
@Index(['taskId'])
@Index(['userId'])
@Index(['createdAt'])
export class TaskActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: [
      'created',
      'updated',
      'status_changed',
      'assigned',
      'unassigned',
      'commented',
      'moved',
      'deleted'
    ],
  })
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'unassigned' | 'commented' | 'moved' | 'deleted';

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Store additional data like old/new values

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Task, (task) => task.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
