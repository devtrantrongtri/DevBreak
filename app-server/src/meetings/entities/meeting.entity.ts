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
import { User } from '../../entities/User';
import { Project } from '../../collab/projects/entities/project.entity';
import { MeetingParticipant } from './meeting-participant.entity';
import { MeetingMessage } from './meeting-message.entity';

@Entity('meetings')
@Index(['status'])
@Index(['projectId'])
@Index(['hostId'])
@Index(['startTime'])
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, unique: true })
  roomId: string;

  @Column({ length: 20, default: 'scheduled' })
  status: string; // scheduled, active, ended, cancelled

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ name: 'host_id' })
  hostId: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @Column({ type: 'boolean', default: true })
  isVideoEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  isAudioEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  isChatEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  isRecording: boolean;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'host_id' })
  host: User;

  @ManyToOne(() => Project, { eager: false })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => MeetingParticipant, (participant) => participant.meeting, { cascade: true })
  participants: MeetingParticipant[];

  @OneToMany(() => MeetingMessage, (message) => message.meeting, { cascade: true })
  messages: MeetingMessage[];

  // Virtual properties
  get isActive(): boolean {
    return this.status === 'active';
  }

  get duration(): number {
    if (this.actualStartTime && this.actualEndTime) {
      return this.actualEndTime.getTime() - this.actualStartTime.getTime();
    }
    return 0;
  }

  get participantCount(): number {
    return this.participants?.filter(p => p.status === 'joined').length || 0;
  }
}
