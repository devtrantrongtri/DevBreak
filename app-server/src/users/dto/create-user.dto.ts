import { IsString, IsNotEmpty, MinLength, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address for login' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password (minimum 6 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Display name of the user' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ example: true, description: 'Whether the user account is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

