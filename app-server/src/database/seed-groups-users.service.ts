import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Group, Permission } from '../entities';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedGroupsUsersService {
  private readonly logger = new Logger(SeedGroupsUsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async seedGroupsAndUsers(): Promise<void> {
    this.logger.log('🌱 Starting to seed groups and users...');

    // Get all permissions for group assignments
    const allPermissions = await this.permissionRepository.find({ where: { isActive: true } });
    
    // Define groups with their permissions
    const groupsData = [
      {
        code: 'GROUP_ADMIN',
        name: 'Quản trị viên',
        description: 'Nhóm quản trị viên có toàn quyền hệ thống',
        permissions: allPermissions, // Full permissions
      },
      {
        code: 'GROUP_PM',
        name: 'Project Manager',
        description: 'Nhóm quản lý dự án',
        permissions: allPermissions.filter(p =>
          p.code.startsWith('dashboard.') ||
          p.code.startsWith('collab.') ||
          p.code.startsWith('meetings.') ||
          p.code.includes('view') ||
          p.code.includes('manage')
        ),
      },
      {
        code: 'GROUP_DEV',
        name: 'Developer',
        description: 'Nhóm lập trình viên',
        permissions: allPermissions.filter(p =>
          p.code.startsWith('dashboard.') ||
          p.code.startsWith('collab.') ||
          p.code.startsWith('meetings.') ||
          p.code.includes('view') ||
          (p.code.includes('tasks') && !p.code.includes('delete')) ||
          (p.code.includes('dailies') && !p.code.includes('delete'))
        ),
      },
      {
        code: 'GROUP_QC',
        name: 'Quality Control',
        description: 'Nhóm kiểm thử chất lượng',
        permissions: allPermissions.filter(p =>
          p.code.startsWith('dashboard.') ||
          p.code.startsWith('collab.') ||
          p.code.startsWith('meetings.') ||
          p.code.includes('view') ||
          (p.code.includes('tasks') && !p.code.includes('delete')) ||
          (p.code.includes('dailies') && !p.code.includes('delete'))
        ),
      },
      {
        code: 'GROUP_BA',
        name: 'Business Analyst',
        description: 'Nhóm phân tích nghiệp vụ',
        permissions: allPermissions.filter(p =>
          p.code.startsWith('dashboard.') ||
          p.code.startsWith('collab.') ||
          p.code.startsWith('meetings.') ||
          p.code.includes('view') ||
          (p.code.includes('projects') && !p.code.includes('delete'))
        ),
      },
      {
        code: 'GROUP_VIEWER',
        name: 'Viewer',
        description: 'Nhóm chỉ xem',
        permissions: allPermissions.filter(p =>
          p.code.includes('view') &&
          !p.code.includes('manage') &&
          !p.code.includes('delete')
        ),
      },
    ];

    // Create groups
    const createdGroups = new Map<string, Group>();
    for (const groupData of groupsData) {
      let group = await this.groupRepository.findOne({
        where: { code: groupData.code },
        relations: ['permissions']
      });

      if (!group) {
        group = this.groupRepository.create({
          code: groupData.code,
          name: groupData.name,
          description: groupData.description,
          permissions: groupData.permissions,
          isActive: true,
        });
        group = await this.groupRepository.save(group);
        this.logger.log(`✓ Created group: ${groupData.name}`);
      } else {
        // Update permissions for existing group
        group.permissions = groupData.permissions;
        group = await this.groupRepository.save(group);
        this.logger.log(`✓ Updated group: ${groupData.name}`);
      }

      createdGroups.set(groupData.code, group);
    }

    // Define users data
    const usersData = [
      {
        email: 'admin',
        displayName: 'Administrator',
        password: 'admin123',
        groupCode: 'GROUP_ADMIN',
      },
      {
        email: 'pm_john',
        displayName: 'John Smith (PM)',
        password: 'pm123',
        groupCode: 'GROUP_PM',
      },
      {
        email: 'dev_alice',
        displayName: 'Alice Johnson (DEV)',
        password: 'dev123',
        groupCode: 'GROUP_DEV',
      },
      {
        email: 'qc_bob',
        displayName: 'Bob Wilson (QC)',
        password: 'qc123',
        groupCode: 'GROUP_QC',
      },
      {
        email: 'ba_carol',
        displayName: 'Carol Brown (BA)',
        password: 'ba123',
        groupCode: 'GROUP_BA',
      },
      {
        email: 'viewer_dave',
        displayName: 'Dave Miller (Viewer)',
        password: 'viewer123',
        groupCode: 'GROUP_VIEWER',
      },
    ];

    // Create users
    for (const userData of usersData) {
      let user = await this.userRepository.findOne({
        where: { email: userData.email },
        relations: ['groups']
      });

      const group = createdGroups.get(userData.groupCode);
      if (!group) {
        this.logger.warn(`Group ${userData.groupCode} not found for user ${userData.email}`);
        continue;
      }

      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        user = this.userRepository.create({
          email: userData.email,
          displayName: userData.displayName,
          passwordHash: hashedPassword,
          groups: [group],
          isActive: true,
        });
        user = await this.userRepository.save(user);
        this.logger.log(`✓ Created user: ${userData.displayName} (${userData.email})`);
      } else {
        // Update user's group if needed
        if (!user.groups.some(g => g.id === group.id)) {
          user.groups = [group];
          user = await this.userRepository.save(user);
          this.logger.log(`✓ Updated user group: ${userData.displayName}`);
        }
      }
    }

    this.logger.log('✅ Groups and users seeding completed!');
  }
}
