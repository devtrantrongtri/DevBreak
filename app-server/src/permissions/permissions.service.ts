import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { code, name, description, parentCode, isActive } = createPermissionDto;

    // Check if code already exists
    const existingPermission = await this.permissionRepository.findOne({ where: { code } });
    if (existingPermission) {
      throw new ConflictException('Permission code already exists');
    }

    // Validate parent code if provided
    if (parentCode) {
      const parentPermission = await this.permissionRepository.findOne({ where: { code: parentCode } });
      if (!parentPermission) {
        throw new NotFoundException(`Parent permission with code "${parentCode}" not found`);
      }
    }

    const permission = this.permissionRepository.create({
      code,
      name,
      description,
      parentCode,
      isActive,
    });

    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { code: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }
    return permission;
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { code } });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    // If updating code, check for conflicts
    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findOne({ 
        where: { code: updatePermissionDto.code } 
      });
      if (existingPermission) {
        throw new ConflictException('Permission code already exists');
      }
    }

    // Validate parent code if provided
    if (updatePermissionDto.parentCode) {
      const parentPermission = await this.permissionRepository.findOne({ 
        where: { code: updatePermissionDto.parentCode } 
      });
      if (!parentPermission) {
        throw new NotFoundException(`Parent permission with code "${updatePermissionDto.parentCode}" not found`);
      }
    }

    await this.permissionRepository.update(id, updatePermissionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.permissionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }
  }

  /**
   * Get permissions organized as a tree structure
   */
  async getPermissionTree(): Promise<any[]> {
    const permissions = await this.findAll();
    
    // Create a map for quick lookup
    const permissionMap = new Map();
    const rootPermissions: any[] = [];

    // First pass: create permission objects and map them
    for (const permission of permissions) {
      const permissionItem = {
        id: permission.id,
        code: permission.code,
        name: permission.name,
        description: permission.description,
        isActive: permission.isActive,
        children: [],
      };
      permissionMap.set(permission.code, permissionItem);
    }

    // Second pass: build hierarchy
    for (const permission of permissions) {
      const permissionItem = permissionMap.get(permission.code);
      
      if (permission.parentCode && permissionMap.has(permission.parentCode)) {
        permissionMap.get(permission.parentCode).children.push(permissionItem);
      } else {
        rootPermissions.push(permissionItem);
      }
    }

    return rootPermissions;
  }

  /**
   * Seed initial permissions based on the taxonomy in README.md
   */
  async seedPermissions(): Promise<void> {
    const permissionsToSeed = [
      // Menu/Navigation permissions
      { code: 'dashboard.view', name: 'View Dashboard', description: 'Access to dashboard page' },
      { code: 'system.manage', name: 'System Management', description: 'Access to system management section' },
      { code: 'system.users.manage', name: 'User Management', description: 'Access to user management', parentCode: 'system.manage' },
      { code: 'system.groups.manage', name: 'Group Management', description: 'Access to group management', parentCode: 'system.manage' },
      { code: 'system.menus.manage', name: 'Menu Management', description: 'Access to menu management', parentCode: 'system.manage' },
      
      // Action permissions
      { code: 'user.create', name: 'Create User', description: 'Create new users' },
      { code: 'user.update', name: 'Update User', description: 'Update existing users' },
      { code: 'user.delete', name: 'Delete User', description: 'Delete users' },
      { code: 'user.read', name: 'Read User', description: 'View user details' },
      
      { code: 'group.create', name: 'Create Group', description: 'Create new groups' },
      { code: 'group.update', name: 'Update Group', description: 'Update existing groups' },
      { code: 'group.delete', name: 'Delete Group', description: 'Delete groups' },
      { code: 'group.assignPermissions', name: 'Assign Group Permissions', description: 'Assign permissions to groups' },
      
      { code: 'menu.updateName', name: 'Update Menu Name', description: 'Update menu names' },
      { code: 'menu.rebindPermission', name: 'Rebind Menu Permission', description: 'Change permission binding for menus' },
      
      // Optional audit permission
      { code: 'audit.read', name: 'Read Audit Logs', description: 'View audit logs' },
    ];

    for (const permissionData of permissionsToSeed) {
      const existing = await this.findByCode(permissionData.code);
      if (!existing) {
        await this.create(permissionData);
      }
    }
  }
}
