import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsIn(['COMPLETED', 'CANCELED'], {
    message: 'Status must be COMPLETED or CANCELED',
  })
  status: string;

  @IsOptional()
  @IsString()
  evaluationNotes?: string;
}
