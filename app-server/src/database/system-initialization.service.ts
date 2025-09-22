import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Group, Permission, Menu } from '../entities';

@Injectable()
export class SystemInitializationService implements OnModuleInit {
  private readonly logger = new Logger(SystemInitializationService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async onModuleInit() {
    await this.initializeSystem();
  }

  /**
   * Khởi tạo hệ thống khi ứng dụng start
   */
  async initializeSystem(): Promise<void> {
    this.logger.log('🚀 Initializing system...');
    
    try {
      // 1. Tạo permissions cơ bản
      await this.ensureBasicPermissions();

      // 2. Tạo GROUP_ADMIN với toàn quyền
      await this.ensureAdminGroup();

      // 3. Tạo user ADMIN và gán vào GROUP_ADMIN
      await this.ensureAdminUser();

      // 4. Tạo menu cơ bản
      await this.ensureBasicMenus();

      this.logger.log('✅ System initialization completed successfully!');
    } catch (error) {
      this.logger.error('❌ System initialization failed:', error);
      throw error;
    }
  }

  /**
   * Tạo permissions cơ bản cho hệ thống
   */
  private async ensureBasicPermissions(): Promise<void> {
    this.logger.log('🔐 Ensuring basic permissions exist...');

    const basicPermissions = [
      // === ROOT MODULE PERMISSIONS ===
      { code: 'dashboard', name: 'Dashboard', description: 'Dashboard module access' },
      { code: 'system', name: 'System Management', description: 'System administration module' },
      { code: 'users', name: 'User Management', description: 'User management module' },
      { code: 'groups', name: 'Group Management', description: 'Group management module' },
      { code: 'permissions', name: 'Permission Management', description: 'Permission management module' },
      { code: 'menus', name: 'Menu Management', description: 'Menu management module' },
      { code: 'audit', name: 'Audit & Logs', description: 'Audit and logging module' },

      // === DASHBOARD PERMISSIONS ===
      { code: 'dashboard.view', name: 'View Dashboard', description: 'Access dashboard page', parentCode: 'dashboard' },
      { code: 'dashboard.stats', name: 'View Statistics', description: 'View dashboard statistics', parentCode: 'dashboard' },

      // === SYSTEM PERMISSIONS ===
      { code: 'system.view', name: 'View System', description: 'Access system management', parentCode: 'system' },
      { code: 'system.configure', name: 'Configure System', description: 'Configure system settings', parentCode: 'system' },

      // === USER PERMISSIONS ===
      { code: 'users.view', name: 'View Users', description: 'View user list and details', parentCode: 'users' },
      { code: 'users.create', name: 'Create Users', description: 'Create new users', parentCode: 'users' },
      { code: 'users.edit', name: 'Edit Users', description: 'Edit user information', parentCode: 'users' },
      { code: 'users.delete', name: 'Delete Users', description: 'Delete users', parentCode: 'users' },
      { code: 'users.manage_groups', name: 'Manage User Groups', description: 'Assign users to groups', parentCode: 'users' },

      // === GROUP PERMISSIONS ===
      { code: 'groups.view', name: 'View Groups', description: 'View group list and details', parentCode: 'groups' },
      { code: 'groups.create', name: 'Create Groups', description: 'Create new groups', parentCode: 'groups' },
      { code: 'groups.edit', name: 'Edit Groups', description: 'Edit group information', parentCode: 'groups' },
      { code: 'groups.delete', name: 'Delete Groups', description: 'Delete groups', parentCode: 'groups' },
      { code: 'groups.manage_members', name: 'Manage Members', description: 'Add/remove group members', parentCode: 'groups' },
      { code: 'groups.manage_permissions', name: 'Manage Permissions', description: 'Assign permissions to groups', parentCode: 'groups' },

      // === PERMISSION PERMISSIONS ===
      { code: 'permissions.view', name: 'View Permissions', description: 'View permission list', parentCode: 'permissions' },
      { code: 'permissions.create', name: 'Create Permissions', description: 'Create new permissions', parentCode: 'permissions' },
      { code: 'permissions.edit', name: 'Edit Permissions', description: 'Edit permission details', parentCode: 'permissions' },
      { code: 'permissions.delete', name: 'Delete Permissions', description: 'Delete permissions', parentCode: 'permissions' },
      { code: 'permissions.sync', name: 'Sync Permissions', description: 'Auto-discover and sync permissions', parentCode: 'permissions' },

      // === MENU PERMISSIONS ===
      { code: 'menus.view', name: 'View Menus', description: 'View menu structure', parentCode: 'menus' },
      { code: 'menus.create', name: 'Create Menus', description: 'Create new menu items', parentCode: 'menus' },
      { code: 'menus.edit', name: 'Edit Menus', description: 'Edit menu items', parentCode: 'menus' },
      { code: 'menus.delete', name: 'Delete Menus', description: 'Delete menu items', parentCode: 'menus' },
      { code: 'menus.reorder', name: 'Reorder Menus', description: 'Change menu order', parentCode: 'menus' },

      // === AUDIT PERMISSIONS ===
      { code: 'audit.view', name: 'View Audit Logs', description: 'View system audit logs', parentCode: 'audit' },
      { code: 'audit.export', name: 'Export Audit Logs', description: 'Export audit data', parentCode: 'audit' },
      { code: 'audit.manage', name: 'Manage Audit Settings', description: 'Configure audit settings', parentCode: 'audit' },

      // === MEETINGS PERMISSIONS ===
      { code: 'meetings', name: 'Meetings Management', description: 'Access to meetings module' },
      { code: 'meetings.view', name: 'View Meetings', description: 'View meetings and participants', parentCode: 'meetings' },
      { code: 'meetings.create', name: 'Create Meetings', description: 'Create new meetings', parentCode: 'meetings' },
      { code: 'meetings.update', name: 'Update Meetings', description: 'Update meeting details', parentCode: 'meetings' },
      { code: 'meetings.delete', name: 'Delete Meetings', description: 'Delete meetings', parentCode: 'meetings' },
      { code: 'meetings.join', name: 'Join Meetings', description: 'Join and leave meetings', parentCode: 'meetings' },
      { code: 'meetings.manage', name: 'Manage Participants', description: 'Manage meeting participants and settings', parentCode: 'meetings' },
      { code: 'meetings.chat', name: 'Meeting Chat', description: 'Send and view chat messages in meetings', parentCode: 'meetings' },
    ];

    for (const permissionData of basicPermissions) {
      const existing = await this.permissionRepository.findOne({ where: { code: permissionData.code } });
      if (!existing) {
        const permission = this.permissionRepository.create({
          code: permissionData.code,
          name: permissionData.name,
          description: permissionData.description,
          parentCode: permissionData.parentCode || null,
          isActive: true
        });
        await this.permissionRepository.save(permission);
        this.logger.log(`  ✓ Created permission: ${permissionData.code}`);
      }
    }
  }

  /**
   * Đảm bảo GROUP_ADMIN tồn tại với toàn quyền
   */
  private async ensureAdminGroup(): Promise<Group> {
    this.logger.log('👥 Ensuring admin group exists...');
    
    let adminGroup = await this.groupRepository.findOne({
      where: { code: 'GROUP_ADMIN' },
      relations: ['permissions']
    });

    // Lấy tất cả permissions
    const allPermissions = await this.permissionRepository.find({
      where: { isActive: true }
    });

    if (!adminGroup) {
      // Tạo GROUP_ADMIN mới
      adminGroup = this.groupRepository.create({
        code: 'GROUP_ADMIN',
        name: 'System Administrator',
        description: 'Full system access group with all permissions',
        isActive: true,
        permissions: allPermissions
      });
      
      await this.groupRepository.save(adminGroup);
      this.logger.log(`✓ Created GROUP_ADMIN with ${allPermissions.length} permissions`);
    } else {
      // Cập nhật permissions cho GROUP_ADMIN (đảm bảo luôn có toàn quyền)
      adminGroup.permissions = allPermissions;
      await this.groupRepository.save(adminGroup);
      this.logger.log(`✓ Updated GROUP_ADMIN with ${allPermissions.length} permissions`);
    }

    return adminGroup;
  }

  /**
   * Đảm bảo user ADMIN tồn tại và thuộc GROUP_ADMIN
   */
  private async ensureAdminUser(): Promise<User> {
    this.logger.log('👤 Ensuring admin user exists...');
    
    let adminUser = await this.userRepository.findOne({
      where: { email: 'admin@system.local' },
      relations: ['groups']
    });

    const adminGroup = await this.groupRepository.findOne({
      where: { code: 'GROUP_ADMIN' }
    });

    if (!adminGroup) {
      throw new Error('GROUP_ADMIN not found. Please run ensureAdminGroup first.');
    }

    if (!adminUser) {
      // Tạo user ADMIN mới
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = this.userRepository.create({
        email: 'admin@system.local',
        passwordHash: hashedPassword,
        displayName: 'System Administrator',
        isActive: true,
        groups: [adminGroup]
      });
      
      await this.userRepository.save(adminUser);
      this.logger.log('✓ Created admin user: admin@system.local / admin123');
    } else {
      // Đảm bảo admin user thuộc GROUP_ADMIN
      const isInAdminGroup = adminUser.groups.some(g => g.code === 'GROUP_ADMIN');
      
      if (!isInAdminGroup) {
        adminUser.groups.push(adminGroup);
        await this.userRepository.save(adminUser);
        this.logger.log('✓ Added admin user to GROUP_ADMIN');
      } else {
        this.logger.log('✓ Admin user already in GROUP_ADMIN');
      }
    }

    return adminUser;
  }

  /**
   * Tạo menu cơ bản cho hệ thống
   */
  private async ensureBasicMenus(): Promise<void> {
    this.logger.log('📋 Ensuring basic menus exist...');
    
    const basicMenus = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'DashboardOutlined',
        order: 1,
        permissionCode: 'dashboard.view'
      },
      {
        name: 'System Management',
        path: '/dashboard/system',
        icon: 'SettingOutlined',
        order: 2,
        permissionCode: 'system.view'
      },
      {
        name: 'User Management',
        path: '/dashboard/users',
        icon: 'UserOutlined',
        order: 1,
        parentPath: '/dashboard/system',
        permissionCode: 'users.view'
      },
      {
        name: 'Group Management',
        path: '/dashboard/groups',
        icon: 'TeamOutlined',
        order: 2,
        parentPath: '/dashboard/system',
        permissionCode: 'groups.view'
      },
      {
        name: 'Permission Management',
        path: '/dashboard/permissions',
        icon: 'SafetyCertificateOutlined',
        order: 3,
        parentPath: '/dashboard/system',
        permissionCode: 'permissions.view'
      },
      {
        name: 'Activity Logs',
        path: '/dashboard/activity-logs',
        icon: 'HistoryOutlined',
        order: 4,
        parentPath: '/dashboard/system',
        permissionCode: 'audit.view'
      },
      {
        name: 'Meetings',
        path: '/dashboard/meetings',
        icon: 'VideoCameraOutlined',
        order: 3,
        permissionCode: 'meetings.view'
      }
    ];

    for (const menuData of basicMenus) {
      const existing = await this.menuRepository.findOne({
        where: { path: menuData.path }
      });

      if (!existing) {
        // Tìm permission
        const permission = await this.permissionRepository.findOne({
          where: { code: menuData.permissionCode }
        });

        if (!permission) {
          this.logger.warn(`⚠️ Permission not found: ${menuData.permissionCode} for menu: ${menuData.name}`);
          continue;
        }

        // Tìm parent menu nếu có
        let parentMenu: Menu | undefined = undefined;
        if ((menuData as any).parentPath) {
          const foundParent = await this.menuRepository.findOne({
            where: { path: (menuData as any).parentPath }
          });
          parentMenu = foundParent || undefined;
        }

        const menu = new Menu();
        menu.name = menuData.name;
        menu.path = menuData.path;
        menu.icon = menuData.icon;
        menu.order = menuData.order;
        menu.isActive = true;
        menu.permission = permission;
        menu.parent = parentMenu;

        await this.menuRepository.save(menu);
        this.logger.log(`✓ Created menu: ${menuData.name}`);
      }
    }
  }

  /**
   * Reset toàn bộ hệ thống (chỉ dùng cho development)
   */
  async resetSystem(): Promise<void> {
    this.logger.warn('🔄 Resetting entire system...');
    
    // Xóa tất cả data theo thứ tự dependency
    await this.menuRepository.delete({});
    await this.userRepository.createQueryBuilder()
      .relation(User, 'groups')
      .of({})
      .remove({});
    await this.groupRepository.createQueryBuilder()
      .relation(Group, 'permissions')
      .of({})
      .remove({});
    
    await this.userRepository.delete({});
    await this.groupRepository.delete({});
    await this.permissionRepository.delete({});
    
    this.logger.log('🗑️ All data cleared');
    
    // Khởi tạo lại hệ thống
    await this.initializeSystem();
  }

  /**
   * Lấy thông tin hệ thống
   */
  async getSystemInfo(): Promise<any> {
    const [userCount, groupCount, permissionCount, menuCount] = await Promise.all([
      this.userRepository.count(),
      this.groupRepository.count(),
      this.permissionRepository.count(),
      this.menuRepository.count()
    ]);

    const adminGroup = await this.groupRepository.findOne({
      where: { code: 'GROUP_ADMIN' },
      relations: ['permissions', 'users']
    });

    return {
      system: {
        initialized: true,
        timestamp: new Date().toISOString()
      },
      counts: {
        users: userCount,
        groups: groupCount,
        permissions: permissionCount,
        menus: menuCount
      },
      adminGroup: adminGroup ? {
        id: adminGroup.id,
        name: adminGroup.name,
        permissionsCount: adminGroup.permissions?.length || 0,
        usersCount: adminGroup.users?.length || 0
      } : null
    };
  }
}
