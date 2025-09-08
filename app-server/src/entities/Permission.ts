import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Group } from './Group';
import { Menu } from './Menu';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, comment: 'e.g., user:create, menu:view_dashboard' })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Group, (group) => group.permissions)
  groups: Group[];

  @OneToMany(() => Menu, (menu) => menu.permission)
  menus: Menu[];
}

