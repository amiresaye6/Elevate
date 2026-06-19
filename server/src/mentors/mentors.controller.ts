import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MentorsService } from './mentors.service';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    //return await this.mentorsService.findOne(id);
  }
}
