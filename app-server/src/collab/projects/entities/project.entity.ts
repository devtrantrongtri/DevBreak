import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../entities/User';
import { ProjectMember } from './project-member.entity';

@Entity('projects')
@Index(['status'])
@Index(['code'])
@Index(['createdBy'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 20, default: 'active' })
  status: string; // active, inactive, completed, archived

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => ProjectMember, (member) => member.project, { cascade: true })
  members: ProjectMember[];

  // Virtual properties
  get isActive(): boolean {
    return this.status === 'active';
  }

  get memberCount(): number {
    return this.members?.filter(m => m.isActive).length || 0;
  }
}
