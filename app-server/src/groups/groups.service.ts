import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Group, Permission, User } from '../entities';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AssignPermissionsDto, UpsertGroupUsersDto } from './dto/assign-permissions.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const { code, name, description, isActive } = createGroupDto;

    // Check if code already exists
    const existingGroup = await this.groupRepository.findOne({ where: { code } });
    if (existingGroup) {
      throw new ConflictException('Group code already exists');
    }

    const group = this.groupRepository.create({
      code,
      name,
      description,
      isActive,
    });

    return this.groupRepository.save(group);
  }

  async findAll(): Promise<Group[]> {
    return this.groupRepository.find({
      relations: ['permissions', 'users'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID "${id}" not found`);
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);

    // If updating code, check for conflicts
    if (updateGroupDto.code && updateGroupDto.code !== group.code) {
      const existingGroup = await this.groupRepository.findOne({
        where: { code: updateGroupDto.code }
      });
      if (existingGroup) {
        throw new ConflictException('Group code already exists');
      }
    }

    await this.groupRepository.update(id, updateGroupDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.groupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Group with ID "${id}" not found`);
    }
  }

  async assignPermissions(id: string, assignPermissionsDto: AssignPermissionsDto): Promise<Group> {
    const group = await this.findOne(id);

    // Find permissions by codes
    const permissions = await this.permissionRepository.find({
      where: { code: In(assignPermissionsDto.permissionCodes), isActive: true },
    });

    if (permissions.length !== assignPermissionsDto.permissionCodes.length) {
      const foundCodes = permissions.map(p => p.code);
      const missingCodes = assignPermissionsDto.permissionCodes.filter(code => !foundCodes.includes(code));
      throw new NotFoundException(`Permissions not found: ${missingCodes.join(', ')}`);
    }

    group.permissions = permissions;
    await this.groupRepository.save(group);

    return this.findOne(id);
  }

  async manageUsers(id: string, upsertGroupUsersDto: UpsertGroupUsersDto): Promise<Group> {
    const group = await this.findOne(id);

    let currentUsers = group.users || [];

    // Add users
    if (upsertGroupUsersDto.addUserIds && upsertGroupUsersDto.addUserIds.length > 0) {
      const usersToAdd = await this.userRepository.find({
        where: { id: In(upsertGroupUsersDto.addUserIds) },
      });

      if (usersToAdd.length !== upsertGroupUsersDto.addUserIds.length) {
        const foundIds = usersToAdd.map(u => u.id);
        const missingIds = upsertGroupUsersDto.addUserIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(`Users not found: ${missingIds.join(', ')}`);
      }

      // Add new users (avoid duplicates)
      const currentUserIds = new Set(currentUsers.map(u => u.id));
      const newUsers = usersToAdd.filter(u => !currentUserIds.has(u.id));
      currentUsers = [...currentUsers, ...newUsers];
    }

    // Remove users
    if (upsertGroupUsersDto.removeUserIds && upsertGroupUsersDto.removeUserIds.length > 0) {
      const removeIds = new Set(upsertGroupUsersDto.removeUserIds);
      currentUsers = currentUsers.filter(u => !removeIds.has(u.id));
    }

    group.users = currentUsers;
    await this.groupRepository.save(group);

    return this.findOne(id);
  }
}
