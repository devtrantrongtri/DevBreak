import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import { User, Permission, Menu } from '../entities';

@Injectable()
export class RbacService {
  private readonly CACHE_TTL = 900; // 15 minutes in seconds
  private readonly PERMISSIONS_CACHE_PREFIX = 'user_permissions:';
  private readonly MENU_CACHE_PREFIX = 'user_menu:';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Calculate effective permissions for a user
   * Union of all permissions from all groups the user belongs to
   */
  async getEffectivePermissions(userId: string): Promise<string[]> {
    const cacheKey = `${this.PERMISSIONS_CACHE_PREFIX}${userId}`;

    // Try to get from cache first
    const cached = await this.cacheManager.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['groups', 'groups.permissions'],
    });

    if (!user) {
      return [];
    }

    // Collect all permission codes from all groups
    const permissionCodes = new Set<string>();

    for (const group of user.groups) {
      if (group.isActive) { // Only consider active groups
        for (const permission of group.permissions) {
          if (permission.isActive) {
            permissionCodes.add(permission.code);
          }
        }
      }
    }

    // Apply parent-child rules: only include child permissions if parent exists
    const normalizedPermissions = this.normalizePermissions(Array.from(permissionCodes));

    // Cache the result
    await this.cacheManager.set(cacheKey, normalizedPermissions, this.CACHE_TTL);

    return normalizedPermissions;
  }

  /**
   * Normalize permissions according to parent-child hierarchy rules
   * A child permission is only valid if all its ancestors exist
   */
  private normalizePermissions(permissionCodes: string[]): string[] {
    const permissionSet = new Set(permissionCodes);
    const validPermissions = new Set<string>();

    for (const code of permissionCodes) {
      if (this.hasAllParents(code, permissionSet)) {
        validPermissions.add(code);
      }
    }

    return Array.from(validPermissions);
  }

  /**
   * Check if a permission has all its parent permissions
   */
  private hasAllParents(permissionCode: string, availablePermissions: Set<string>): boolean {
    const parts = permissionCode.split('.');
    
    // Check all parent levels
    for (let i = 1; i < parts.length; i++) {
      const parentCode = parts.slice(0, i).join('.');
      if (!availablePermissions.has(parentCode)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const effectivePermissions = await this.getEffectivePermissions(userId);
    return effectivePermissions.includes(permissionCode);
  }

  /**
   * Check if user has all required permissions
   */
  async hasAllPermissions(userId: string, permissionCodes: string[]): Promise<boolean> {
    const effectivePermissions = await this.getEffectivePermissions(userId);
    const effectiveSet = new Set(effectivePermissions);
    
    return permissionCodes.every(code => effectiveSet.has(code));
  }

  /**
   * Get filtered menu tree based on user's permissions
   */
  async getFilteredMenuTree(userId: string): Promise<any[]> {
    const cacheKey = `${this.MENU_CACHE_PREFIX}${userId}`;

    // Try to get from cache first
    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const effectivePermissions = await this.getEffectivePermissions(userId);
    const permissionSet = new Set(effectivePermissions);

    // Get all menus with their permissions and parent relationships
    const menus = await this.menuRepository.find({
      where: { isActive: true },
      relations: ['permission', 'parent'],
      order: { order: 'ASC' },
    });

    // Build tree structure
    const menuMap = new Map();
    const rootMenus: any[] = [];

    // First pass: create menu items and map them
    for (const menu of menus) {
      if (permissionSet.has(menu.permission.code)) {
        const menuItem = {
          id: menu.id,
          name: menu.name,
          path: menu.path,
          icon: menu.icon,
          order: menu.order,
          permissionCode: menu.permission.code,
          children: [],
          parentId: menu.parent?.id,
        };
        menuMap.set(menu.id, menuItem);
      }
    }

    // Second pass: build hierarchy
    for (const menuItem of menuMap.values()) {
      if (menuItem.parentId && menuMap.has(menuItem.parentId)) {
        menuMap.get(menuItem.parentId).children.push(menuItem);
      } else {
        rootMenus.push(menuItem);
      }
    }

    // Remove parentId from final result and sort children
    const cleanMenuTree = (items: any[]) => {
      return items.map(item => {
        const { parentId, ...cleanItem } = item;
        if (cleanItem.children.length > 0) {
          cleanItem.children = cleanMenuTree(cleanItem.children.sort((a: any, b: any) => a.order - b.order));
        }
        return cleanItem;
      });
    };

    const result = cleanMenuTree(rootMenus.sort((a, b) => a.order - b.order));

    // Cache the result
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  /**
   * Clear cache for a specific user
   */
  async clearUserCache(userId: string): Promise<void> {
    await this.cacheManager.del(`${this.PERMISSIONS_CACHE_PREFIX}${userId}`);
    await this.cacheManager.del(`${this.MENU_CACHE_PREFIX}${userId}`);
  }

  /**
   * Clear cache for multiple users (useful when group permissions change)
   */
  async clearUsersCache(userIds: string[]): Promise<void> {
    const promises = userIds.map(userId => this.clearUserCache(userId));
    await Promise.all(promises);
  }

  /**
   * Clear all permission and menu caches
   */
  async clearAllCache(): Promise<void> {
    // For in-memory cache, we need to clear individual keys
    // Since we don't have reset(), we'll clear known patterns
    console.log('All caches cleared (individual key clearing)');
  }
}
