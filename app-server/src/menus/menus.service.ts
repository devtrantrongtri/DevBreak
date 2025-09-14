import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Menu, Permission } from '../entities';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto, UpdateMenuNameDto, RebindMenuPermissionDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: TreeRepository<Menu>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const { name, path, icon, order, isActive, permissionCode, parentId } = createMenuDto;

    // Check if path already exists
    const existingMenu = await this.menuRepository.findOne({ where: { path } });
    if (existingMenu) {
      throw new ConflictException('Menu path already exists');
    }

    // Find permission by code
    const permission = await this.permissionRepository.findOne({ 
      where: { code: permissionCode, isActive: true } 
    });
    if (!permission) {
      throw new NotFoundException(`Permission with code "${permissionCode}" not found`);
    }

    // Find parent if specified
    let parent: Menu | undefined = undefined;
    if (parentId) {
      const foundParent = await this.menuRepository.findOne({ where: { id: parentId } });
      if (!foundParent) {
        throw new NotFoundException(`Parent menu with ID "${parentId}" not found`);
      }
      parent = foundParent;
    }

    const menu = this.menuRepository.create({
      name,
      path,
      icon,
      order: order || 0,
      isActive,
      permission,
      parent,
    });

    return this.menuRepository.save(menu);
  }

  async findAll(): Promise<Menu[]> {
    // Use TreeRepository to get proper hierarchy without duplicates
    return this.menuRepository.find({
      relations: ['permission', 'parent'],
      order: { order: 'ASC' },
    });
  }

  async findTree(): Promise<Menu[]> {
    return this.menuRepository.findTrees();
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['permission', 'parent', 'children'],
    });
    
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }
    
    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);

    // If updating path, check for conflicts
    if (updateMenuDto.path && updateMenuDto.path !== menu.path) {
      const existingMenu = await this.menuRepository.findOne({ 
        where: { path: updateMenuDto.path } 
      });
      if (existingMenu) {
        throw new ConflictException('Menu path already exists');
      }
    }

    // If updating permission, validate it exists
    if (updateMenuDto.permissionCode) {
      const permission = await this.permissionRepository.findOne({ 
        where: { code: updateMenuDto.permissionCode, isActive: true } 
      });
      if (!permission) {
        throw new NotFoundException(`Permission with code "${updateMenuDto.permissionCode}" not found`);
      }
      menu.permission = permission;
    }

    // If updating parent, validate it exists
    if (updateMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({ where: { id: updateMenuDto.parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent menu with ID "${updateMenuDto.parentId}" not found`);
      }
      menu.parent = parent;
    }

    // Update other fields
    Object.assign(menu, {
      name: updateMenuDto.name || menu.name,
      path: updateMenuDto.path || menu.path,
      icon: updateMenuDto.icon !== undefined ? updateMenuDto.icon : menu.icon,
      order: updateMenuDto.order !== undefined ? updateMenuDto.order : menu.order,
      isActive: updateMenuDto.isActive !== undefined ? updateMenuDto.isActive : menu.isActive,
    });

    return this.menuRepository.save(menu);
  }

  async updateName(id: string, updateMenuNameDto: UpdateMenuNameDto): Promise<Menu> {
    const menu = await this.findOne(id);
    menu.name = updateMenuNameDto.name;
    return this.menuRepository.save(menu);
  }

  async rebindPermission(id: string, rebindMenuPermissionDto: RebindMenuPermissionDto): Promise<Menu> {
    const menu = await this.findOne(id);
    
    const permission = await this.permissionRepository.findOne({ 
      where: { code: rebindMenuPermissionDto.permissionCode, isActive: true } 
    });
    if (!permission) {
      throw new NotFoundException(`Permission with code "${rebindMenuPermissionDto.permissionCode}" not found`);
    }

    menu.permission = permission;
    return this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);
    
    // Check if menu has children
    const children = await this.menuRepository.findDescendants(menu);
    if (children.length > 1) { // > 1 because findDescendants includes the menu itself
      throw new ConflictException('Cannot delete menu with children. Delete children first.');
    }

    const result = await this.menuRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }
  }

  /**
   * Seed initial menu structure based on README.md design
   */
  async seedMenus(): Promise<void> {
    const menusToSeed = [
      // Root menus
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'DashboardOutlined',
        order: 1,
        permissionCode: 'dashboard.view',
      },
      {
        name: 'System Management',
        path: '/system',
        icon: 'SettingOutlined',
        order: 2,
        permissionCode: 'system.manage',
      },
    ];

    // Create root menus first
    const createdMenus = new Map<string, Menu>();
    
    for (const menuData of menusToSeed) {
      const existing = await this.menuRepository.findOne({ where: { path: menuData.path } });
      if (!existing) {
        const menu = await this.create(menuData);
        createdMenus.set(menuData.path, menu);
      } else {
        createdMenus.set(menuData.path, existing);
      }
    }

    // Create child menus
    const systemParent = createdMenus.get('/system');
    if (systemParent) {
      const childMenus = [
        {
          name: 'User Management',
          path: '/system/users',
          icon: 'UserOutlined',
          order: 1,
          permissionCode: 'system.users.manage',
          parentId: systemParent.id,
        },
        {
          name: 'Group Management',
          path: '/system/groups',
          icon: 'TeamOutlined',
          order: 2,
          permissionCode: 'system.groups.manage',
          parentId: systemParent.id,
        },
        {
          name: 'Menu Management',
          path: '/system/menus',
          icon: 'MenuOutlined',
          order: 3,
          permissionCode: 'system.menus.manage',
          parentId: systemParent.id,
        },
      ];

      for (const childMenuData of childMenus) {
        const existing = await this.menuRepository.findOne({ where: { path: childMenuData.path } });
        if (!existing) {
          await this.create(childMenuData);
        }
      }
    }
  }
}
