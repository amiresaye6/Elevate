import { Controller, Post, UseGuards } from '@nestjs/common';
import { Get, Patch} from '@nestjs/common'
import { Param, Body, Query, ParseIntPipe} from '@nestjs/common'

import { AdminService } from './admin.service'
import { UsersService } from './../users/users.service'
import {UpdateUserStatusDto} from './dtos/updateUserStatus.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService:AdminService){}
    
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('ADMIN')
    @Patch('users/:id/status')
    async updateUserStatus(@Param('id',ParseIntPipe) id: number,@Body() body:UpdateUserStatusDto){
        const userId = id;
        const newStatus = body.isBlocked ;
        const updatedUser = await this.adminService.updateUserStatus(newStatus,userId)
        return {
            success:'true',
            message:"user's status was updated successfully", 
            data:{updatedUser}
        }
    }


    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('ADMIN')
    @Get('sessions')
    async getAllSessions(@Query('page',ParseIntPipe) page:number){
        const data =await this.adminService.getAllSessions(page);
        return {
            success:'true', 
            message:'sessions were fetched successfully', 
            data
        }
    }


    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('ADMIN')
    @Get('dashboard')
    async getDashboard(){
        const dashboard = await this.adminService.getDasboard();
        return {
            success:'true', 
            message:'dashboard data was fetched successfully', 
            data:{dashboard}
        }
    }

    @Get('/need-verify')
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('ADMIN')
    async getNeedVerification(@Query('page',ParseIntPipe) page: number){
        const data = await this.adminService.getNeedVerification(page);
        return {
        success : true,
        message : "mentors fetched successfully",
        data
        }
    }

    @Post('/verify/:id')
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('ADMIN')
    async verifyMentor(@Param('id')id:number){
        const mentor = await this.adminService.verifyMentor(id);
        return {
        success : true,
        message : "mentor verified successfully",
        data : {mentor}
        }
    }
}
