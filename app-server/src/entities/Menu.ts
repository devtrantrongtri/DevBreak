import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Tree, TreeChildren, TreeParent } from 'typeorm';
import { Permission } from './Permission';

@Entity('menus')
@Tree('closure-table')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., 'Dashboard', 'User Management'

  @Column()
  path: string; // e.g., '/dashboard', '/users'

  @Column({ nullable: true })
  icon: string; // e.g., 'DashboardOutlined'

  @Column({ type: 'int', default: 0 })
  order: number; // To sort menus at the same level

  @ManyToOne(() => Permission, (permission) => permission.menus, { nullable: false })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @TreeChildren()
  children: Menu[];

  @TreeParent()
  parent: Menu;
}

