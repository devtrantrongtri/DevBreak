import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Group } from './Group';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, comment: 'Email address used for login' })
  email: string;

  @Column({ comment: 'Hashed password' })
  passwordHash?: string;

  @Column({ comment: 'Display name of the user' })
  displayName: string;

  @Column({ default: true, comment: 'Whether the user account is active' })
  isActive: boolean;

  @ManyToMany(() => Group, (group) => group.users)
  @JoinTable({
    name: 'user_groups',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' },
  })
  groups: Group[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

