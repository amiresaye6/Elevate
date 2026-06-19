import { Controller, NotFoundException } from '@nestjs/common';
import { Get, Patch} from '@nestjs/common'
import { Param, Body, Query, ParseIntPipe} from '@nestjs/common'

import { AdminService } from './admin.service'
import {UpdateUserStatusDto} from './dtos/updateUserStatus.dto'

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService:AdminService){}

    @Get('users')
    async getAllUsers(@Query('page',ParseIntPipe) page:number){
        const {users,pagination} =await this.adminService.getAllUsers(page);
        return {success:'true', message:'users were fetched successfully',users,pagination }
    }

    @Patch('users/:id/status')
    async updateUserStatus(@Param('id',ParseIntPipe) id: number,@Body() body:UpdateUserStatusDto){
        const userId = id;
        const newStatus = body.isBlocked ;
        let updatedUser;
        try{
            updatedUser = await this.adminService.updateUserStatus(newStatus,userId)
        }catch(error:any){
            if(error.code =='P2025'){
                throw new NotFoundException(`user with id=${id} not found`);
            }
            throw error;
        }
        
        return {success:'true', message:"user's status was updated successfully", updatedUser}
    }

    @Get('sessions')
    async getAllSeesions(@Query('page',ParseIntPipe) page:number){
        const {sessions,pagination} =await this.adminService.getAllSessions(page);
        return {success:'true', message:'sessions were fetched successfully', sessions,pagination}
    }

    @Get('dashboard')
    async getDashboard(){
        const dashboard = await this.adminService.getDasboard();
        return {success:'true', message:'dashboard data was fetched successfully', dashboard}
    }
}
