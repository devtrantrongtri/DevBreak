import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('components')
@Index(['category'])
@Index(['isActive'])
@Unique(['key']) // Component key must be unique globally
export class Component {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Component ID', example: 'uuid-here' })
  id: string;

  @Column({ length: 100, unique: true })
  @ApiProperty({ description: 'Unique component key', example: 'team-performance' })
  key: string;

  @Column({ length: 200 })
  @ApiProperty({ description: 'Display name', example: 'Team Performance Dashboard' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Component description', example: 'Track team productivity metrics' })
  description: string;

  @Column({ length: 50, default: 'dashboard' })
  @ApiProperty({ description: 'Component category', example: 'dashboard' })
  category: string; // 'dashboard', 'analytics', 'management', 'reporting'

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ description: 'Component configuration schema', example: { theme: 'light', showMetrics: true } })
  configSchema: Record<string, any> | null; // JSON schema for component configuration

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ description: 'Default visibility roles', example: ['PM', 'BC'] })
  defaultRoles: string[] | null; // Default roles that can see this component

  @Column({ default: true })
  @ApiProperty({ description: 'Whether component is active', example: true })
  isActive: boolean;

  @Column({ default: false })
  @ApiProperty({ description: 'Whether component is built-in (cannot be deleted)', example: false })
  isBuiltIn: boolean;

  @Column({ name: 'created_by', nullable: true })
  @ApiProperty({ description: 'User who created this component', example: 'uuid-here' })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
