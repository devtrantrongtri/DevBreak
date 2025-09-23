import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../entities/User';
import { Meeting } from './meeting.entity';

@Entity('meeting_messages')
@Index(['meetingId'])
@Index(['senderId'])
@Index(['createdAt'])
export class MeetingMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'meeting_id' })
  meetingId: string;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 20, default: 'text' })
  type: string; // text, file, image, system, reaction

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // file info, reaction data, etc.

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'reply_to_id', nullable: true })
  replyToId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Meeting, (meeting) => meeting.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => MeetingMessage, { nullable: true })
  @JoinColumn({ name: 'reply_to_id' })
  replyTo: MeetingMessage;

  // Virtual properties
  get isSystem(): boolean {
    return this.type === 'system';
  }

  get isFile(): boolean {
    return ['file', 'image'].includes(this.type);
  }

  get fileName(): string | null {
    return this.metadata?.fileName || null;
  }

  get fileSize(): number | null {
    return this.metadata?.fileSize || null;
  }

  get fileUrl(): string | null {
    return this.metadata?.fileUrl || null;
  }
}
