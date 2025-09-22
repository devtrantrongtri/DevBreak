import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../entities/User';
import { Meeting } from './meeting.entity';

@Entity('meeting_participants')
@Index(['meetingId', 'userId'])
@Unique(['meetingId', 'userId'])
export class MeetingParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'meeting_id' })
  meetingId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 20, default: 'invited' })
  status: string; // invited, joined, left, removed

  @Column({ length: 20, default: 'participant' })
  role: string; // host, co-host, participant, viewer

  @Column({ type: 'timestamp', nullable: true })
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date;

  @Column({ type: 'boolean', default: true })
  isVideoEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  isAudioEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  isScreenSharing: boolean;

  @Column({ type: 'boolean', default: false })
  isMuted: boolean;

  @Column({ type: 'boolean', default: true })
  canSpeak: boolean;

  @Column({ type: 'boolean', default: true })
  canChat: boolean;

  @Column({ type: 'json', nullable: true })
  connectionInfo: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Meeting, (meeting) => meeting.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Virtual properties
  get isActive(): boolean {
    return this.status === 'joined';
  }

  get isHost(): boolean {
    return this.role === 'host';
  }

  get canControl(): boolean {
    return ['host', 'co-host'].includes(this.role);
  }

  get duration(): number {
    if (this.joinedAt && this.leftAt) {
      return this.leftAt.getTime() - this.joinedAt.getTime();
    }
    if (this.joinedAt && !this.leftAt) {
      return Date.now() - this.joinedAt.getTime();
    }
    return 0;
  }
}
