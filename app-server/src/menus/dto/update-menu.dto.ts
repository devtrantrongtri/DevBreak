import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { CreateMenuDto } from './create-menu.dto';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}

export class UpdateMenuNameDto {
  @ApiProperty({ example: 'New Menu Name', description: 'New name for the menu' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class RebindMenuPermissionDto {
  @ApiProperty({ example: 'dashboard.view', description: 'New permission code to bind to this menu' })
  @IsString()
  @IsNotEmpty()
  permissionCode: string;
}
