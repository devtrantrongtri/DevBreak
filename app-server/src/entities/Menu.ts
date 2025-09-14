import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Tree, TreeChildren, TreeParent, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Permission } from './Permission';

@Entity('menus')
@Tree('closure-table')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: 'Display name of the menu item' })
  name: string;

  @Column({ comment: 'Route path for navigation' })
  path: string;

  @Column({ nullable: true, comment: 'Icon name for the menu item' })
  icon: string;

  @Column({ type: 'int', default: 0, comment: 'Sort order within the same level' })
  order: number;

  @Column({ default: true, comment: 'Whether the menu item is active' })
  isActive: boolean;

  @ManyToOne(() => Permission, (permission) => permission.menus, { nullable: false })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @TreeChildren()
  children: Menu[];

  @TreeParent()
  parent?: Menu;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

