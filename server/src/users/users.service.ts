import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service'

@Injectable()
export class UsersService {

    constructor(private readonly prismaService:PrismaService){}

    async getAllUsers(page:number){
            const [users,totalItems] = await Promise.all([
                this.prismaService.user.findMany({
                    skip:(page-1)*10,
                    take:10,
                }),
                this.prismaService.user.count()
            ])
            
            const totalPages = Math.ceil(totalItems/10);
            if(page && page>totalPages && totalPages>0){
                throw new NotFoundException(`page not found. max page number = ${totalPages}`)
            }
            const pagination = {page,limit:10,totalItems,totalPages};
            
            return {users,pagination}
            
    }

    async getUserById(id:number){
        try{
            const user = await this.prismaService.user.findUnique({
                where:{id}
            });
            return user
        }catch(error:any){
            if(error.code =='P2025'){
                throw new NotFoundException(`user with id=${id} not found`);
            }
        } 
    }

    async getUserByEmail(email:string){
        try{
            const user = await this.prismaService.user.findUnique({
                where:{email}
            });
            return user
        }catch(error:any){
            if(error.code =='P2025'){
                throw new NotFoundException(`user with email=${email} not found`);
            }
        } 
    }
}
