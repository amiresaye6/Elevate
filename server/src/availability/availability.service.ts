import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/availability.dto';
import { UpdateAvailabilityDto } from './dto/availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {} 

  async findAllByMentor(mentorId: number) {
    return this.prisma.mentorAvailability.findMany({ 
      where: { mentorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async create(dto: CreateAvailabilityDto) {
    return this.prisma.mentorAvailability.create({
      data: {
        mentorId: dto.mentorId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async update(
    id: number,
    dto: UpdateAvailabilityDto,
    requestingMentorId: number,
  ) {
    const slot = await this.prisma.mentorAvailability.findUnique({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundException(`Availability slot #${id} not found`);
    }

    if (slot.mentorId !== requestingMentorId) {
      throw new ForbiddenException(
        'You cannot modify another mentor availability slot',
      );
    }

    return this.prisma.mentorAvailability.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: number, requestingMentorId: number) {
    const slot = await this.prisma.mentorAvailability.findUnique({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundException(`Availability slot #${id} not found`);
    }

    if (slot.mentorId !== requestingMentorId) {
      throw new ForbiddenException(
        'You cannot delete another mentor availability slot',
      );
    }

    await this.prisma.mentorAvailability.delete({ where: { id } });
    return { message: `Availability slot #${id} deleted successfully` };
  }
}