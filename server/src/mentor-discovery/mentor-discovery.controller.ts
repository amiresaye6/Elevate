/* eslint-disable prettier/prettier */
import { Controller, Get, Query ,Param } from '@nestjs/common';
import { MentorDiscoveryService } from './mentor-discovery.service';

@Controller('mentors') 
export class MentorDiscoveryController {
  constructor(private readonly mentorDiscoveryService: MentorDiscoveryService) {}

  @Get()
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('stack') stack?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mentorDiscoveryService.findAll({ keyword, stack, page, limit });
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.mentorDiscoveryService.findOne(Number(id));
  }
  @Get('../stacks')
  async getStacks() {
    return this.mentorDiscoveryService.findStacks();
  }
}