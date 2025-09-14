import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RbacService } from './rbac.service';
import { User } from '../entities';
import { AuthResponseDto, MeResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private rbacService: RbacService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && user.isActive && user.passwordHash && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User): Promise<AuthResponseDto> {
    const payload = { 
      email: user.email, 
      sub: user.id,
      displayName: user.displayName 
    };

    const effectivePermissions = await this.rbacService.getEffectivePermissions(user.id);

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.mapToUserProfile(user),
      effectivePermissions,
    };
  }

  async getMe(userId: string): Promise<MeResponseDto> {
    const user = await this.usersService.findOne(userId);
    const effectivePermissions = await this.rbacService.getEffectivePermissions(userId);
    const menuTree = await this.rbacService.getFilteredMenuTree(userId);

    return {
      user: this.mapToUserProfile(user),
      effectivePermissions,
      menuTree,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);

    if (!user.passwordHash) {
      throw new BadRequestException('User does not have a password set');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    // Update password
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return { message: 'Password changed successfully' };
  }

  private mapToUserProfile(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
