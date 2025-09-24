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
    // Clear existing menus first
    const allMenus = await this.menuRepository.find();
    if (allMenus.length > 0) {
      await this.menuRepository.remove(allMenus);
    }

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
          name: 'Collab Hub',
          path: '/dashboard/collab',
          icon: 'LayoutOutlined',
          order: 2,
          permissionCode: 'collab.projects.view',

        },
        {
          name: 'Daily Reports',
          path: '/dashboard/collab/dailies',
          icon: 'CalendarOutlined',
          order: 3,
          permissionCode: 'collab.dailies.view',

        },
        {
          name: 'PM Dashboard',
          path: '/dashboard/collab/pm-daily',
          icon: 'SafetyCertificateOutlined',
          order: 5,
          permissionCode: 'collab.projects.view',

        },
      {
        name: 'Meetings',
        path: '/dashboard/meetings',
        icon: 'PhoneOutlined',
        order: 4,
        permissionCode: 'meetings.view',
      },
      {
        name: 'Cài đặt',
        path: '/system',
        icon: 'SettingOutlined',
        order: 6,
        permissionCode: 'system.manage',
      },
    ];

    // Create root menus first
    const createdMenus = new Map<string, Menu>();

    for (const menuData of menusToSeed) {
      const menu = await this.create(menuData);
      createdMenus.set(menuData.path, menu);
    }

    // // Create Collab Hub child menus
    // const collabParent = createdMenus.get('/dashboard/collab');
    // if (collabParent) {
    //   const collabChildMenus = [
    //     {
    //       name: 'Hub',
    //       path: '/dashboard/collab',
    //       icon: 'LayoutOutlined',
    //       order: 1,
    //       permissionCode: 'collab.projects.view',
    //       parentId: collabParent.id,
    //     },
    //     {
    //       name: 'Daily Reports',
    //       path: '/dashboard/collab/dailies',
    //       icon: 'CalendarOutlined',
    //       order: 3,
    //       permissionCode: 'collab.dailies.view',
    //       parentId: collabParent.id,
    //     },
    //     {
    //       name: 'PM Dashboard',
    //       path: '/dashboard/collab/pm-daily',
    //       icon: 'SafetyCertificateOutlined',
    //       order: 4,
    //       permissionCode: 'collab.projects.view',
    //       parentId: collabParent.id,
    //     },
    //   ];

    //   for (const childMenuData of collabChildMenus) {
    //     await this.create(childMenuData);
    //   }
    // }

    // Create System child menus
    const systemParent = createdMenus.get('/system');
    if (systemParent) {
      const systemChildMenus = [
        {
          name: 'Nhật ký hoạt động',
          path: '/dashboard/activity-logs',
          icon: 'RocketOutlined',
          order: 1,
          permissionCode: 'dashboard.view',
          parentId: systemParent.id,
        },
        {
          name: 'Quản lý Users',
          path: '/dashboard/users',
          icon: 'UserOutlined',
          order: 2,
          permissionCode: 'users.view',
          parentId: systemParent.id,
        },
        {
          name: 'Permissions',
          path: '/dashboard/permissions',
          icon: 'SafetyCertificateOutlined',
          order: 3,
          permissionCode: 'permissions.view',
          parentId: systemParent.id,
        },
        {
          name: 'Menu',
          path: '/dashboard/menus',
          icon: 'MenuOutlined',
          order: 4,
          permissionCode: 'menus.view',
          parentId: systemParent.id,
        },
        {
          name: 'Nhóm',
          path: '/dashboard/groups',
          icon: 'TeamOutlined',
          order: 5,
          permissionCode: 'groups.view',
          parentId: systemParent.id,
        },
      ];

      for (const childMenuData of systemChildMenus) {
        await this.create(childMenuData);
      }
    }
  }
}
