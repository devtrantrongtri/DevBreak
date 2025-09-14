import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Group } from '../entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, displayName, isActive } = createUserDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      passwordHash,
      displayName,
      isActive,
    });

    await this.userRepository.save(user);
    // Don't return the password hash
    delete user.passwordHash;
    return user;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: ['groups', 'groups.permissions'],
      order: { createdAt: 'DESC' },
      cache: {
        id: 'users_list',
        milliseconds: 30000, // Cache for 30 seconds
      },
    });

    // Remove password hashes from all users
    return users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['groups', 'groups.permissions'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, relations: ['groups', 'groups.permissions'] });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // Rename password to passwordHash for the entity
    const updatePayload: any = { ...updateUserDto };
    if (updatePayload.password) {
      updatePayload.passwordHash = updatePayload.password;
      delete updatePayload.password;
    }

    await this.userRepository.update(id, updatePayload);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  async assignGroups(userId: string, groupIds: string[]): Promise<User> {
    const user = await this.findOne(userId);

    // Find groups by IDs
    const groups = await this.groupRepository.find({
      where: { id: In(groupIds), isActive: true },
    });

    if (groups.length !== groupIds.length) {
      const foundIds = groups.map(g => g.id);
      const missingIds = groupIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Groups not found: ${missingIds.join(', ')}`);
    }

    user.groups = groups;
    await this.userRepository.save(user);

    return this.findOne(userId);
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { passwordHash: hashedPassword });
  }
}
