import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Permission } from './Permission';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, comment: 'Unique group code/identifier' })
  code: string;

  @Column({ comment: 'Display name of the group' })
  name: string;

  @Column({ nullable: true, comment: 'Description of the group' })
  description: string;

  @Column({ default: true, comment: 'Whether the group is active' })
  isActive: boolean;

  @ManyToMany(() => User, (user) => user.groups)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.groups)
  @JoinTable({
    name: 'group_permissions',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

