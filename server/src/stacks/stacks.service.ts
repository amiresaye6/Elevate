import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async getAllStacksWithPagination(page:number) {
    const [stacks,totalItems] = await Promise.all([
      this.prisma.stack.findMany({
        skip:(page-1)*10,
        take:10,
       }),
      this.prisma.stack.count()
    ])
    const totalPages = Math.ceil(totalItems/10);
    if(page && page>totalPages && totalPages>0){
      throw new NotFoundException(`page not found. max page number = ${totalPages}`)
    }
    const pagination = {page,limit:10,totalItems,totalPages};  
    return {stacks,pagination}
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

