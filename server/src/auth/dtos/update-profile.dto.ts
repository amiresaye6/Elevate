import {
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  name?: string;

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
