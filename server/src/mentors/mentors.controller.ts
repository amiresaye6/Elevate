import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MentorsService } from './mentors.service';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.mentorsService.findOne(id);
  }
  // GET /mentors/:id/dashboard
  @Get(':id/dashboard')
  getDashboard(@Param('id', ParseIntPipe) id: number) {
    return this.mentorsService.getDashboard(id);
  }  
}
