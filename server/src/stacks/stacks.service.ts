import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createStackDto,updateStackDto } from './dto/Stack.dto'

@Injectable()
export class StacksService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.stack.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createStack(data:createStackDto){
    try{
      const stack = await this.prisma.stack.create({
        data
      });
      return stack;
    }catch(error:any){
      if(error.code=='P2002'){
        throw new BadRequestException(
        `Stack name ${data.name} already exists`
        );
      }
      throw new BadRequestException(error.message)
    }
  }

  async updateStack(id:number,data:updateStackDto){
    try{
      const stack = await this.prisma.stack.update({
        where:{id},
        data
      });
      return stack;
    }catch(error:any){
      if(error.code=='P2002'){
        throw new BadRequestException(
        `Stack name ${data.name} already exists`
        );
      }
      throw new BadRequestException(error.message)
    }
  }

  async deleteStack(id:number){
    try{
      const stack = await this.prisma.stack.delete({
        where:{id}
      });
      return stack;
    }catch(error:any){
      throw new BadRequestException(error.message)
    }
  }
}

