import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { User } from '@phishing-simulator/shared-types';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  @IsIn(['ADMIN', 'USER'], { message: 'Invalid role' })
  role?: User['role'];
}
