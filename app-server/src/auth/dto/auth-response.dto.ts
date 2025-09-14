import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MenuItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  path: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  permissionCode: string;

  @ApiProperty({ type: [MenuItemDto], required: false })
  children?: MenuItemDto[];
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ type: [String] })
  effectivePermissions: string[];
}

export class MeResponseDto {
  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ type: [String] })
  effectivePermissions: string[];

  @ApiProperty({ type: [MenuItemDto] })
  menuTree: MenuItemDto[];
}
