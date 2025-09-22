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
import { User } from '../../../entities/User';
import { Project } from '../../projects/entities/project.entity';

@Entity('dailies')
@Index(['projectId'])
@Index(['userId'])
@Index(['date'])
@Unique(['projectId', 'userId', 'date']) // One daily per user per project per day
export class Daily {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'date' })
  date: string; // Format: YYYY-MM-DD

  @Column({ type: 'text' })
  yesterday: string; // What did you do yesterday?

  @Column({ type: 'text' })
  today: string; // What will you do today?

  @Column({ type: 'text', nullable: true })
  blockers: string; // Any blockers or issues?

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Project, { eager: false })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
