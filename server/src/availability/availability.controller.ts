import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
} from './dto/availability.dto';

interface RequestWithUser extends Request {
  user?: {
    mentorProfile?: {
      id: number;
    };
  };
}

@Controller('api/availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // GET /api/availability?mentorId=1
  @Get()
  findAll(@Query('mentorId', ParseIntPipe) mentorId: number) {
    return this.availabilityService.findAllByMentor(mentorId);
  }

  // POST /api/availability
  @Post()
  create(@Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.create(dto);
  }

  // PUT /api/availability/:id
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvailabilityDto,
    @Request() req: RequestWithUser,
  ) {
    const requestingMentorId = req?.user?.mentorProfile?.id ?? 0;
    return this.availabilityService.update(id, dto, requestingMentorId);
  }

  // DELETE /api/availability/:id
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    const requestingMentorId = req?.user?.mentorProfile?.id ?? 0;
    return this.availabilityService.remove(id, requestingMentorId);
  }
}