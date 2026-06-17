import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateAvailabilityDto } from './dto/availability.dto';
import { UpdateAvailabilityDto } from './dto/availability.dto';

const prisma = new PrismaClient();

@Injectable()
export class AvailabilityService {

  // GET /api/availability?mentorId=X
  async findAllByMentor(mentorId: number) {
    return prisma.mentorAvailability.findMany({
      where: { mentorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  // POST /api/availability
  async create(dto: CreateAvailabilityDto) {
    return prisma.mentorAvailability.create({
      data: {
        mentorId: dto.mentorId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  // PUT /api/availability/:id
  async update(
    id: number,
    dto: UpdateAvailabilityDto,
    requestingMentorId: number,
  ) {
    const slot = await prisma.mentorAvailability.findUnique({
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

    return prisma.mentorAvailability.update({
      where: { id },
      data: { ...dto },
    });
  }

  // DELETE /api/availability/:id
  async remove(id: number, requestingMentorId: number) {
    const slot = await prisma.mentorAvailability.findUnique({
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

    await prisma.mentorAvailability.delete({ where: { id } });

    return { message: `Availability slot #${id} deleted successfully` };
  }
}