import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../entities/Permission';
import { PERMISSIONS_KEY } from '../auth/decorators/permissions.decorator';

export interface DiscoveredPermission {
  code: string;
  name: string;
  description: string;
  source: string; // Controller và method nào sử dụng
  module: string; // Module name (e.g., 'system', 'user', 'dashboard')
  parentCode?: string; // Parent permission code
}

export interface PermissionModule {
  name: string;
  displayName: string;
  permissions: DiscoveredPermission[];
}

export interface SyncResult {
  created: string[];
  updated: string[];
  discovered: number;
  existing: number;
}

@Injectable()
export class PermissionDiscoveryService {
  private readonly logger = new Logger(PermissionDiscoveryService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Tự động phát hiện tất cả permissions từ controllers
   */
  async discoverPermissions(): Promise<DiscoveredPermission[]> {
    const discoveredPermissions = new Map<string, DiscoveredPermission>();

    // Lấy tất cả controllers
    const controllers = this.discoveryService.getControllers();

    for (const controller of controllers) {
      await this.scanController(controller, discoveredPermissions);
    }

    return Array.from(discoveredPermissions.values());
  }

  /**
   * Quét một controller để tìm permissions
   */
  private async scanController(
    wrapper: InstanceWrapper,
    discoveredPermissions: Map<string, DiscoveredPermission>
  ): Promise<void> {
    const { instance, metatype } = wrapper;
    
    if (!instance || !metatype) return;

    const controllerName = metatype.name;
    
    // Quét class-level permissions
    const classPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, metatype);
    if (classPermissions) {
      for (const permission of classPermissions) {
        this.addDiscoveredPermission(
          discoveredPermissions,
          permission,
          `${controllerName} (class-level)`
        );
      }
    }

    // Quét method-level permissions
    const methodNames = this.metadataScanner.getAllMethodNames(Object.getPrototypeOf(instance));
    
    for (const methodName of methodNames) {
      const methodRef = instance[methodName];
      if (typeof methodRef !== 'function') continue;

      const methodPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, methodRef);
      if (methodPermissions) {
        for (const permission of methodPermissions) {
          this.addDiscoveredPermission(
            discoveredPermissions,
            permission,
            `${controllerName}.${methodName}`
          );
        }
      }
    }
  }

  /**
   * Thêm permission được phát hiện vào map
   */
  private addDiscoveredPermission(
    discoveredPermissions: Map<string, DiscoveredPermission>,
    permissionCode: string,
    source: string
  ): void {
    if (!discoveredPermissions.has(permissionCode)) {
      const module = this.extractModuleFromPermissionCode(permissionCode);
      const parentCode = this.getParentPermissionCode(permissionCode);

      discoveredPermissions.set(permissionCode, {
        code: permissionCode,
        name: this.generatePermissionName(permissionCode),
        description: this.generatePermissionDescription(permissionCode),
        source: source,
        module: module,
        parentCode: parentCode
      });
    } else {
      // Cập nhật source nếu permission đã tồn tại
      const existing = discoveredPermissions.get(permissionCode)!;
      existing.source += `, ${source}`;
    }
  }

  /**
   * Extract module name from permission code
   */
  private extractModuleFromPermissionCode(permissionCode: string): string {
    const parts = permissionCode.split('.');
    return parts[0] || 'general';
  }

  /**
   * Get parent permission code
   */
  private getParentPermissionCode(permissionCode: string): string | undefined {
    const parts = permissionCode.split('.');
    if (parts.length > 1) {
      return parts.slice(0, -1).join('.');
    }
    return undefined;
  }

  /**
   * Tự động tạo tên permission từ code
   */
  private generatePermissionName(code: string): string {
    return code
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  /**
   * Tự động tạo mô tả permission từ code
   */
  private generatePermissionDescription(code: string): string {
    const parts = code.split('.');
    const action = parts[parts.length - 1];
    const resource = parts.slice(0, -1).join(' ');
    
    const actionMap: Record<string, string> = {
      'read': 'View',
      'create': 'Create',
      'update': 'Update', 
      'delete': 'Delete',
      'manage': 'Manage',
      'view': 'View'
    };

    const actionText = actionMap[action] || action;
    return `${actionText} ${resource || 'system'}`.trim();
  }

  /**
   * Sync discovered permissions with database
   */
  async syncPermissions(): Promise<SyncResult> {
    this.logger.log('🔍 Discovering permissions from controllers...');

    const discovered = await this.discoverPermissions();
    const result: SyncResult = {
      created: [],
      updated: [],
      discovered: discovered.length,
      existing: 0
    };

    this.logger.log(`📋 Found ${discovered.length} permissions in code`);

    // First, create parent permissions
    await this.ensureParentPermissions(discovered);

    // Then sync all discovered permissions
    for (const permission of discovered) {
      const existing = await this.permissionRepository.findOne({
        where: { code: permission.code }
      });

      if (!existing) {
        const newPermission = this.permissionRepository.create({
          code: permission.code,
          name: permission.name,
          description: `${permission.description} (Auto-discovered from: ${permission.source})`,
          parentCode: permission.parentCode || null,
          isActive: true
        });

        await this.permissionRepository.save(newPermission);
        result.created.push(permission.code);
        this.logger.log(`  ✓ Created permission: ${permission.code}`);
      } else {
        result.existing++;
        // Optionally update description to include source info
        if (!existing.description?.includes('Auto-discovered')) {
          existing.description = `${existing.description} (Auto-discovered from: ${permission.source})`;
          await this.permissionRepository.save(existing);
          result.updated.push(permission.code);
        }
      }
    }

    this.logger.log('✅ Permission synchronization completed');
    return result;
  }

  /**
   * Get permissions organized by modules
   */
  async getPermissionsByModules(): Promise<PermissionModule[]> {
    const discovered = await this.discoverPermissions();
    const moduleMap = new Map<string, DiscoveredPermission[]>();

    // Group permissions by module
    for (const permission of discovered) {
      if (!moduleMap.has(permission.module)) {
        moduleMap.set(permission.module, []);
      }
      moduleMap.get(permission.module)!.push(permission);
    }

    // Convert to PermissionModule array
    const modules: PermissionModule[] = [];
    for (const [moduleName, permissions] of moduleMap) {
      modules.push({
        name: moduleName,
        displayName: this.generateModuleDisplayName(moduleName),
        permissions: permissions.sort((a, b) => a.code.localeCompare(b.code))
      });
    }

    return modules.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Generate display name for module
   */
  private generateModuleDisplayName(moduleName: string): string {
    const displayNames: { [key: string]: string } = {
      'system': 'System Management',
      'user': 'User Management',
      'group': 'Group Management',
      'dashboard': 'Dashboard',
      'audit': 'Audit & Logs',
      'menu': 'Menu Management',
      'general': 'General'
    };

    return displayNames[moduleName] || moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  }



  /**
   * Lấy parent code từ permission code
   */
  private getParentCode(code: string): string | null {
    const parts = code.split('.');
    return parts.length > 1 ? parts.slice(0, -1).join('.') : null;
  }

  /**
   * Xóa permissions không còn được sử dụng trong code (tùy chọn)
   */
  async cleanupUnusedPermissions(dryRun: boolean = true): Promise<string[]> {
    this.logger.log('🧹 Checking for unused permissions...');

    const discoveredPermissions = await this.discoverPermissions();
    const discoveredCodes = new Set(discoveredPermissions.map(p => p.code));

    // Lấy tất cả permissions từ database
    const allPermissions = await this.permissionRepository.find();

    // Tìm permissions không còn được sử dụng (trừ parent permissions)
    const unusedPermissions = allPermissions.filter(permission => {
      // Không xóa parent permissions
      if (this.isParentPermission(permission.code, discoveredCodes)) {
        return false;
      }

      // Không xóa permissions được tạo thủ công (có thể check bằng description)
      if (permission.description && !permission.description.includes('Auto-discovered')) {
        return false;
      }

      return !discoveredCodes.has(permission.code);
    });

    if (dryRun) {
      this.logger.log(`📋 Found ${unusedPermissions.length} unused permissions (dry run)`);
      return unusedPermissions.map(p => p.code);
    }

    // Thực sự xóa permissions
    const removedCodes: string[] = [];
    for (const permission of unusedPermissions) {
      // Kiểm tra xem permission có đang được sử dụng bởi groups không
      const permissionWithGroups = await this.permissionRepository.findOne({
        where: { id: permission.id },
        relations: ['groups', 'menus']
      });

      if (permissionWithGroups?.groups && permissionWithGroups.groups.length > 0) {
        this.logger.warn(`⚠️  Skipping ${permission.code} - still assigned to groups`);
        continue;
      }

      if (permissionWithGroups?.menus && permissionWithGroups.menus.length > 0) {
        this.logger.warn(`⚠️  Skipping ${permission.code} - still assigned to menus`);
        continue;
      }

      await this.permissionRepository.remove(permission);
      removedCodes.push(permission.code);
      this.logger.log(`  ✓ Removed unused permission: ${permission.code}`);
    }

    this.logger.log(`🧹 Cleanup completed. Removed ${removedCodes.length} permissions`);
    return removedCodes;
  }

  /**
   * Kiểm tra xem một permission có phải là parent permission không
   */
  private isParentPermission(code: string, allCodes: Set<string>): boolean {
    // Kiểm tra xem có permission nào khác có parent là code này không
    for (const otherCode of allCodes) {
      if (otherCode !== code && otherCode.startsWith(code + '.')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Tạo parent permissions nếu chưa tồn tại
   */
  private async ensureParentPermissions(discoveredPermissions: DiscoveredPermission[]): Promise<void> {
    const parentCodes = new Set<string>();
    
    // Thu thập tất cả parent codes
    for (const permission of discoveredPermissions) {
      const parts = permission.code.split('.');
      for (let i = 1; i < parts.length; i++) {
        parentCodes.add(parts.slice(0, i).join('.'));
      }
    }

    // Tạo parent permissions
    for (const parentCode of parentCodes) {
      const existing = await this.permissionRepository.findOne({
        where: { code: parentCode }
      });

      if (!existing) {
        const permission = this.permissionRepository.create({
          code: parentCode,
          name: this.generatePermissionName(parentCode),
          description: `Parent permission for ${parentCode} operations`,
          parentCode: this.getParentCode(parentCode),
          isActive: true
        });

        await this.permissionRepository.save(permission);
        this.logger.log(`  ✓ Created parent permission: ${parentCode}`);
      }
    }
  }
}
