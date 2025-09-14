import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'varchar', comment: 'Type of action performed (login, logout, create, update, delete, view)' })
  action: string;

  @Column({ type: 'varchar', comment: 'Resource that was affected (user, group, permission, menu, profile)' })
  resource: string;

  @Column({ type: 'varchar', nullable: true, comment: 'ID of the affected resource' })
  resourceId: string | null;

  @Column({ type: 'jsonb', nullable: true, comment: 'Additional details about the action' })
  details: Record<string, any> | null;

  @Column({ type: 'varchar', comment: 'IP address of the user' })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true, comment: 'User agent string' })
  userAgent: string | null;

  @Column({ type: 'varchar', nullable: true, comment: 'HTTP method used' })
  method: string | null;

  @Column({ type: 'varchar', nullable: true, comment: 'Request path' })
  path: string | null;

  @Column({ type: 'varchar', default: 'success', comment: 'Status of the action (success, error)' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
