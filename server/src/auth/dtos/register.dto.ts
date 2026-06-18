import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsNumber, Min } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsEnum(Role, { message: 'Role must be STUDENT or MENTOR' })
  @IsNotEmpty({ message: 'Role is required' })
  role: Role;

  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  // Mentor specific fields (optional on class level, but checked conditionally in service or validation)
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber({}, { message: 'stackId must be a number' })
  stackId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'hourlyRate must be a positive number' })
  @Min(0, { message: 'hourlyRate must be greater than or equal to 0' })
  hourlyRate?: number;
}
