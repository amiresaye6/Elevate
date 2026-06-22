import {
  IsString,
  IsNotEmpty,
  IsInt,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsInt()
  mentorId!: number;

  @IsString()
  @IsNotEmpty()
  dayOfWeek!: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime!: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime!: string;
}

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  dayOfWeek?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime?: string;
}
