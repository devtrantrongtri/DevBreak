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
      
      // Meetings
      { code: 'collab.meetings', name: 'Meetings Module', description: 'Base meetings module access', parentCode: 'collab' },
      { code: 'collab.meetings.view', name: 'View Meetings', description: 'Xem danh sách cuộc họp', parentCode: 'collab.meetings' },
      { code: 'collab.meetings.create', name: 'Create Meetings', description: 'Tạo cuộc họp mới', parentCode: 'collab.meetings' },
      { code: 'collab.meetings.join', name: 'Join Meetings', description: 'Tham gia cuộc họp', parentCode: 'collab.meetings' },
      { code: 'collab.meetings.manage', name: 'Manage Meetings', description: 'Quản lý cuộc họp', parentCode: 'collab.meetings' },
      { code: 'collab.meetings.chat', name: 'Meeting Chat', description: 'Trò chuyện trong cuộc họp', parentCode: 'collab.meetings' },
    ];

    // Seed permissions in order - first parent permissions, then child permissions
    // This ensures that parent permissions exist before child permissions are created
    const permissionsByLevel = {};
    
    // Group permissions by level (number of dots in code)
    collabPermissions.forEach(permission => {
      const level = permission.code.split('.').length - 1;
      if (!permissionsByLevel[level]) {
        permissionsByLevel[level] = [];
      }
      permissionsByLevel[level].push(permission);
    });
    
    // Seed permissions level by level
    const levels = Object.keys(permissionsByLevel).sort((a, b) => Number(a) - Number(b));
    
    for (const level of levels) {
      console.log(`  🔹 Seeding level ${level} permissions...`);
      
      for (const permissionData of permissionsByLevel[level]) {
        try {
          // Check if parent permission exists if it has a parent
          if (permissionData.parentCode) {
            const parentExists = await this.permissionRepository.findOne({ 
              where: { code: permissionData.parentCode } 
            });
            
            if (!parentExists) {
              console.log(`  ⚠️ Parent permission ${permissionData.parentCode} not found for ${permissionData.code}`);
              console.log(`  🔄 Creating parent permission ${permissionData.parentCode} first...`);
              
              // Create a basic parent permission
              const parentParts = permissionData.parentCode.split('.');
              const parentName = parentParts[parentParts.length - 1].charAt(0).toUpperCase() + 
                               parentParts[parentParts.length - 1].slice(1);
              
              const parentPermission = this.permissionRepository.create({
                code: permissionData.parentCode,
                name: `${parentName} Module`,
                description: `Base ${parentName.toLowerCase()} module access`,
                parentCode: parentParts.length > 1 ? parentParts.slice(0, -1).join('.') : null
              });
              
              await this.permissionRepository.save(parentPermission);
              console.log(`  ✓ Created missing parent permission: ${permissionData.parentCode}`);
            }
          }
          
          // Now create/update the permission
          const existing = await this.permissionRepository.findOne({ where: { code: permissionData.code } });
          if (!existing) {
            const permission = this.permissionRepository.create(permissionData);
            await this.permissionRepository.save(permission);
            console.log(`  ✓ Created permission: ${permissionData.code}`);
          } else {
            // Update existing permission
            await this.permissionRepository.update(
              { code: permissionData.code },
              { 
                name: permissionData.name, 
                description: permissionData.description,
                parentCode: permissionData.parentCode
              }
            );
            console.log(`  ℹ️ Updated permission: ${permissionData.code}`);
          }
        } catch (error) {
          console.error(`  ❌ Error creating permission ${permissionData.code}: ${error.message}`);
        }
      }
    }

    console.log('✅ Collab permissions seeding completed!');
  }
}
