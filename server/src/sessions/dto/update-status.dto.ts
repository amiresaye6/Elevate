import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { SessionStatus } from '@prisma/client';
export class UpdateStatusDto {
  @IsEnum(SessionStatus, {
    message: 'Status must be SCHEDULED, COMPLETED or CANCELED',
  })
  status!: SessionStatus;

  @IsOptional()
  @IsString()
  evaluationNotes?: string;
}
