/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MentorDiscoveryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { keyword?: string; stack?: string; page?: string; limit?: string }) {
    const page = parseInt(String(query.page || '1')) || 1;
    const limit = parseInt(String(query.limit || '10')) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      user: {
        isBlocked: false, 
      },
      isVerified: true, 
    };

    if (query.keyword) {
      whereClause.OR = [
        { name: { contains: query.keyword } },
        { title: { contains: query.keyword } },
      ];
    }

    if (query.stack) {
      whereClause.stackId = parseInt(query.stack);
    }

    try {
      const mentors = await this.prisma.mentorProfile.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        include: {
          stack: true, 
        },
      });

      const totalItems = await this.prisma.mentorProfile.count({ where: whereClause });
      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        message: 'Mentors retrieved successfully',
        data: mentors,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      };
    } catch (dbError) {
      console.error('Database Error Detail:', dbError);
      throw dbError;
    }
  }
  async findOne(id: number) {
    try {
      const mentor = await this.prisma.mentorProfile.findUnique({
        where: { id: id },
        include: {
          stack: true,
          availability: true, 
        },
      });

      if (!mentor) {
        return {
          success: false,
          message: `Mentor with ID ${id} not found`,
          data: null,
        };
      }

      return {
        success: true,
        message: 'Mentor details retrieved successfully',
        data: mentor,
      };
    } catch (dbError) {
      console.error('Database Error Detail:', dbError);
      throw dbError;
    }
  }
  async findStacks() {
    try {
      const stacks = await this.prisma.stack.findMany();
      return {
        success: true,
        message: 'Stacks retrieved successfully',
        data: stacks,
      };
    } catch (dbError) {
      console.error('Database Error Detail:', dbError);
      throw dbError;
    }
  }
}