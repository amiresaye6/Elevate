import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    const mentor = await this.prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        stack: true,
        availability: true,
      },
    });

    if (!mentor) {
      throw new NotFoundException(`Mentor with ID ${id} not found.`);
    }

    return {
      success: true,
      data: mentor,
    };
  }
}
