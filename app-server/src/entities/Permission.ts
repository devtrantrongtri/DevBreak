import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Group } from './Group';
import { Menu } from './Menu';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, comment: 'Permission code e.g., dashboard.view, system.manage, user.create' })
  code: string;

  @Column({ comment: 'Human readable name' })
  name: string;

  @Column({ nullable: true, comment: 'Description of what this permission allows' })
  description: string;

  @Column({ nullable: true, comment: 'Parent permission code for hierarchical permissions' })
  parentCode: string;

  @Column({ default: true, comment: 'Whether this permission is active' })
  isActive: boolean;

  @ManyToMany(() => Group, (group) => group.permissions)
  groups: Group[];

  @OneToMany(() => Menu, (menu) => menu.permission)
  menus: Menu[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

