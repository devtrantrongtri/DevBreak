import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities';

@Injectable()
export class CollabPermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async seedCollabPermissions(): Promise<void> {
    console.log('🌱 Seeding Collab permissions...');
    
    const collabPermissions = [
      // Projects
      { code: 'collab', name: 'Collaboration Module', description: 'Base collaboration module access' },
      { code: 'collab.projects', name: 'Projects Module', description: 'Base projects module access', parentCode: 'collab' },
      { code: 'collab.projects.view', name: 'View Projects', description: 'Xem danh sách dự án', parentCode: 'collab.projects' },
      { code: 'collab.projects.create', name: 'Create Projects', description: 'Tạo dự án mới', parentCode: 'collab.projects' },
      { code: 'collab.projects.update', name: 'Update Projects', description: 'Cập nhật thông tin dự án', parentCode: 'collab.projects' },
      { code: 'collab.projects.delete', name: 'Delete Projects', description: 'Xóa dự án', parentCode: 'collab.projects' },
      { code: 'collab.projects.manage_members', name: 'Manage Project Members', description: 'Quản lý thành viên dự án', parentCode: 'collab.projects' },
      
      // Tasks
      { code: 'collab.tasks', name: 'Tasks Module', description: 'Base tasks module access', parentCode: 'collab' },
      { code: 'collab.tasks.view', name: 'View Tasks', description: 'Xem danh sách task', parentCode: 'collab.tasks' },
      { code: 'collab.tasks.create', name: 'Create Tasks', description: 'Tạo task mới', parentCode: 'collab.tasks' },
      { code: 'collab.tasks.update', name: 'Update Tasks', description: 'Cập nhật task', parentCode: 'collab.tasks' },
      { code: 'collab.tasks.delete', name: 'Delete Tasks', description: 'Xóa task', parentCode: 'collab.tasks' },
      { code: 'collab.tasks.assign', name: 'Assign Tasks', description: 'Gán task cho người khác', parentCode: 'collab.tasks' },
      
      // Dailies
      { code: 'collab.dailies', name: 'Dailies Module', description: 'Base dailies module access', parentCode: 'collab' },
      { code: 'collab.dailies.view', name: 'View Daily Reports', description: 'Xem báo cáo daily', parentCode: 'collab.dailies' },
      { code: 'collab.dailies.create', name: 'Create Daily Reports', description: 'Tạo báo cáo daily', parentCode: 'collab.dailies' },
      { code: 'collab.dailies.update', name: 'Update Daily Reports', description: 'Cập nhật báo cáo daily', parentCode: 'collab.dailies' },
      { code: 'collab.dailies.view_all', name: 'View All Daily Reports', description: 'Xem tất cả daily của team', parentCode: 'collab.dailies' },
      
      // Summary
      { code: 'collab.summary', name: 'Summary Module', description: 'Base summary module access', parentCode: 'collab' },
      { code: 'collab.summary.view', name: 'View Summary', description: 'Xem tổng hợp báo cáo', parentCode: 'collab.summary' },
    ];

    for (const permissionData of collabPermissions) {
      const existing = await this.permissionRepository.findOne({ where: { code: permissionData.code } });
      if (!existing) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        console.log(`  ✓ Created permission: ${permissionData.code}`);
      } else {
        console.log(`  ℹ️ Permission already exists: ${permissionData.code}`);
      }
    }

    console.log('✅ Collab permissions seeding completed!');
  }
}
