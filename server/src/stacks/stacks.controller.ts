import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { StacksService } from './stacks.service';
import { createStackDto,updateStackDto } from './dto/Stack.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('stacks')
export class StacksController {
  constructor(private readonly stacksService: StacksService) {}

  @Get()
  async getAll() {
    return await this.stacksService.getAll();
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('ADMIN')
  @Post()
  async createStack(@Body()data:createStackDto){
    const stack = await this.stacksService.createStack(data);
    return {
      success:true,
      message:"stack has been created successfully",
      data:{stack}
    };
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async updateStack(@Param('id',ParseIntPipe)id:number, @Body()data:updateStackDto){
    const stack = await this.stacksService.updateStack(id,data);
    return {
      success:true,
      message:"stack has been updated successfully",
      data:{stack}
    };
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteStack(@Param('id',ParseIntPipe)id:number){
    const stack = await this.stacksService.deleteStack(id);
    return {
      success:true,
      message:"stack has been deleted successfully",
      data:{stack}
    };
  }
}

