import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RbacService } from './rbac.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, MeResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private rbacService: RbacService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile and permissions' })
  @ApiResponse({ status: 200, description: 'User profile retrieved', type: MeResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req): Promise<MeResponseDto> {
    return this.authService.getMe(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('menus/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get filtered menu tree for current user' })
  @ApiResponse({ status: 200, description: 'Menu tree retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyMenus(@Request() req) {
    return this.rbacService.getFilteredMenuTree(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('debug/clear-cache')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear user cache and get fresh data for debugging' })
  async debugClearCache(@Request() req) {
    await this.rbacService.clearAllCache();

    // Get fresh data
    const effectivePermissions = await this.rbacService.getEffectivePermissions(req.user.userId);
    const menuTree = await this.rbacService.getFilteredMenuTree(req.user.userId);

    return {
      message: 'Cache cleared and fresh data retrieved',
      userId: req.user.userId,
      effectivePermissions,
      menuTree,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }
}
