import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Group, Permission, Menu } from '../entities';
import { seedCollabData } from '../collab/seed-collab-data';
import { SeedGroupsUsersService } from './seed-groups-users.service';
import { MenusService } from '../menus/menus.service';
import { CollabPermissionsService } from '../collab/seed-collab-permissions';

@Injectable()
export class SeedingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    private dataSource: DataSource,
    private seedGroupsUsersService: SeedGroupsUsersService,
    private menusService: MenusService,
    private collabPermissionsService: CollabPermissionsService,
  ) {}

  async seedAll(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    await this.seedPermissions();
    await this.collabPermissionsService.seedCollabPermissions();
    await this.menusService.seedMenus();
    await this.seedGroupsUsersService.seedGroupsAndUsers();
    await seedCollabData(this.dataSource);

    console.log('✅ Database seeding completed!');
  }

  private async seedPermissions(): Promise<void> {
    console.log('📋 Seeding permissions...');
    
    const permissions = [
      // Parent permissions (required by RBAC hierarchy)
      { code: 'dashboard', name: 'Dashboard Access', description: 'Base dashboard access permission' },
      { code: 'system', name: 'System Access', description: 'Base system access permission' },
      { code: 'user', name: 'User Access', description: 'Base user management permission' },
      { code: 'group', name: 'Group Access', description: 'Base group management permission' },
      { code: 'menu', name: 'Menu Access', description: 'Base menu management permission' },
      { code: 'audit', name: 'Audit Access', description: 'Base audit access permission' },

      // Menu/Navigation permissions
      { code: 'dashboard.view', name: 'View Dashboard', description: 'Access to dashboard page', parentCode: 'dashboard' },
      { code: 'system.manage', name: 'System Management', description: 'Access to system management section', parentCode: 'system' },
      { code: 'system.users', name: 'User Section', description: 'Access to user section', parentCode: 'system' },
      { code: 'system.users.manage', name: 'User Management', description: 'Access to user management', parentCode: 'system.users' },
      { code: 'system.groups', name: 'Group Section', description: 'Access to group section', parentCode: 'system' },
      { code: 'system.groups.manage', name: 'Group Management', description: 'Access to group management', parentCode: 'system.groups' },
      { code: 'system.menus', name: 'Menu Section', description: 'Access to menu section', parentCode: 'system' },
      { code: 'system.menus.manage', name: 'Menu Management', description: 'Access to menu management', parentCode: 'system.menus' },

      // Action permissions
      { code: 'user.create', name: 'Create User', description: 'Create new users', parentCode: 'user' },
      { code: 'user.update', name: 'Update User', description: 'Update existing users', parentCode: 'user' },
      { code: 'user.delete', name: 'Delete User', description: 'Delete users', parentCode: 'user' },
      { code: 'user.read', name: 'Read User', description: 'View user details', parentCode: 'user' },

      { code: 'group.create', name: 'Create Group', description: 'Create new groups', parentCode: 'group' },
      { code: 'group.update', name: 'Update Group', description: 'Update existing groups', parentCode: 'group' },
      { code: 'group.delete', name: 'Delete Group', description: 'Delete groups', parentCode: 'group' },
      { code: 'group.assignPermissions', name: 'Assign Group Permissions', description: 'Assign permissions to groups', parentCode: 'group' },

      { code: 'menu.updateName', name: 'Update Menu Name', description: 'Update menu names', parentCode: 'menu' },
      { code: 'menu.rebindPermission', name: 'Rebind Menu Permission', description: 'Change permission binding for menus', parentCode: 'menu' },

      // Audit permissions
      { code: 'audit.read', name: 'Read Audit Logs', description: 'View audit logs', parentCode: 'audit' },
      { code: 'audit.manage', name: 'Manage Audit Logs', description: 'Manage audit logs', parentCode: 'audit' },
    ];

    for (const permissionData of permissions) {
      const existing = await this.permissionRepository.findOne({ where: { code: permissionData.code } });
      if (!existing) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        console.log(`  ✓ Created permission: ${permissionData.code}`);
      }
    }
  }



  private async seedGroups(): Promise<void> {
    console.log('👥 Seeding groups...');
    
    // Get all permissions for admin group
    const allPermissions = await this.permissionRepository.find({ where: { isActive: true } });
    
    // Create admin group with all permissions
    const adminGroupData = {
      code: 'admin',
      name: 'Administrators',
      description: 'System administrators with full access',
      isActive: true,
    };

    let adminGroup = await this.groupRepository.findOne({ where: { code: adminGroupData.code } });
    if (!adminGroup) {
      adminGroup = this.groupRepository.create(adminGroupData);
      adminGroup.permissions = allPermissions;
      await this.groupRepository.save(adminGroup);
      console.log(`  ✓ Created admin group with ${allPermissions.length} permissions`);
    } else {
      // Update existing admin group with all permissions
      adminGroup.permissions = allPermissions;
      await this.groupRepository.save(adminGroup);
      console.log(`  ✓ Updated admin group with ${allPermissions.length} permissions`);
    }

    // Create user group with limited permissions
    const userPermissions = await this.permissionRepository.find({
      where: { 
        code: In(['dashboard.view', 'user.read']) 
      }
    });

    const userGroupData = {
      code: 'users',
      name: 'Regular Users',
      description: 'Regular users with limited access',
      isActive: true,
    };

    let userGroup = await this.groupRepository.findOne({ where: { code: userGroupData.code } });
    if (!userGroup) {
      userGroup = this.groupRepository.create(userGroupData);
      userGroup.permissions = userPermissions;
      await this.groupRepository.save(userGroup);
      console.log(`  ✓ Created user group with ${userPermissions.length} permissions`);
    }
  }

  private async seedUsers(): Promise<void> {
    console.log('👤 Seeding users...');
    
    // Get admin group
    const adminGroup = await this.groupRepository.findOne({
      where: { code: 'admin' },
      relations: ['permissions']
    });

    console.log(`  📊 Admin group found: ${adminGroup ? 'YES' : 'NO'}`);
    if (adminGroup) {
      console.log(`  📊 Admin group permissions count: ${adminGroup.permissions?.length || 0}`);
    }

    // Create admin user
    const adminUserData = {
      email: 'admin@example.com',
      displayName: 'System Administrator',
      passwordHash: await bcrypt.hash('admin123', 10),
      isActive: true,
    };

    let adminUser = await this.userRepository.findOne({ where: { email: adminUserData.email } });
    if (!adminUser) {
      adminUser = this.userRepository.create(adminUserData);
      if (adminGroup) {
        adminUser.groups = [adminGroup];
        console.log(`  📊 Assigned admin user to admin group with ${adminGroup.permissions?.length || 0} permissions`);
      } else {
        console.log(`  ❌ Admin group not found! Cannot assign permissions.`);
      }
      await this.userRepository.save(adminUser);
      console.log(`  ✓ Created admin user: ${adminUserData.email} (password: admin123)`);
    } else {
      console.log(`  ℹ️ Admin user already exists: ${adminUserData.email}`);
    }

    // Create demo user
    const userGroup = await this.groupRepository.findOne({ 
      where: { code: 'users' },
      relations: ['permissions']
    });

    const demoUserData = {
      email: 'user@example.com',
      displayName: 'Demo User',
      passwordHash: await bcrypt.hash('user123', 10),
      isActive: true,
    };

    let demoUser = await this.userRepository.findOne({ where: { email: demoUserData.email } });
    if (!demoUser) {
      demoUser = this.userRepository.create(demoUserData);
      if (userGroup) {
        demoUser.groups = [userGroup];
      }
      await this.userRepository.save(demoUser);
      console.log(`  ✓ Created demo user: ${demoUserData.email} (password: user123)`);
    }
  }

  async debugDatabaseState() {
    // Check permissions
    const permissions = await this.permissionRepository.find();

    // Check groups with permissions
    const groups = await this.groupRepository.find({ relations: ['permissions'] });

    // Check users with groups and permissions
    const users = await this.userRepository.find({
      relations: ['groups', 'groups.permissions']
    });

    return {
      permissions: {
        count: permissions.length,
        items: permissions.map(p => ({ code: p.code, name: p.name, isActive: p.isActive }))
      },
      groups: {
        count: groups.length,
        items: groups.map(g => ({
          code: g.code,
          name: g.name,
          isActive: g.isActive,
          permissionsCount: g.permissions?.length || 0,
          permissions: g.permissions?.map(p => p.code) || []
        }))
      },
      users: {
        count: users.length,
        items: users.map(u => ({
          email: u.email,
          displayName: u.displayName,
          isActive: u.isActive,
          groupsCount: u.groups?.length || 0,
          groups: u.groups?.map(g => ({
            code: g.code,
            name: g.name,
            permissionsCount: g.permissions?.length || 0
          })) || []
        }))
      }
    };
  }
}
