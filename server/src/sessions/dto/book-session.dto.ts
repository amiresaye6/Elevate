import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class BookSessionDto {
  @IsNotEmpty()
  @IsInt()
  mentorId: number;

  @IsNotEmpty()
  @IsISO8601()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  description: string;

  @IsOptional()
  @IsInt()
  studentId?: number;
}
