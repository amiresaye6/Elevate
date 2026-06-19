import { Controller, Get } from '@nestjs/common';
import { StacksService } from './stacks.service';

@Controller('stacks')
export class StacksController {
  constructor(private readonly stacksService: StacksService) {}

  @Get()
  getAll() {
    return this.stacksService.getAll();
  }
}

