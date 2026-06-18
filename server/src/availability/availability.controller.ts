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
  UseGuards,
} from '@nestjs/common';

import { AvailabilityService } from './availability.service';
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
} from './dto/availability.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get()
  findAll(@Query('mentorId', ParseIntPipe) mentorId: number) {
    return this.availabilityService.findAllByMentor(mentorId);
  }


  @Post()
  create(@Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.create(dto);
  }


  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvailabilityDto,
    @Request() req: RequestWithUser,
  ) {
    return this.availabilityService.update(
      id,
      dto,
      req.user.id,
    );
  }


  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    
    @Request() req: RequestWithUser,
  ) {
    console.log("TOKEN USER =>", req.user);
    return this.availabilityService.remove(
      id,
      req.user.id,
    );
  }
}