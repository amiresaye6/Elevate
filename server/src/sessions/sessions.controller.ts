import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Param,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { BookSessionDto } from './dto/book-session.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('book')
  async bookSession(@Body() dto: BookSessionDto) {
    // TODO: Extract studentId from authenticated user (req.user) once AuthModule is integrated.
    return await this.sessionsService.bookSession(dto);
  }

  @Get()
  async getMySessions(
    @Query('role') role?: string,
    @Query('profileId') profileId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // TODO: Extract role and profileId from authenticated user (req.user) once AuthModule is integrated.
    // For testing without auth, fallback to default student if not provided.
    const resolvedRole = role || 'student';
    let resolvedProfileId = profileId ? Number(profileId) : null;

    if (!resolvedProfileId) {
      if (resolvedRole.toLowerCase() === 'student') {
        const student = await this.prisma.studentProfile.findFirst();
        if (!student) {
          throw new NotFoundException(
            'No students found in the database. Please seed first.',
          );
        }
        resolvedProfileId = student.id;
      } else {
        const mentor = await this.prisma.mentorProfile.findFirst();
        if (!mentor) {
          throw new NotFoundException(
            'No mentors found in the database. Please seed first.',
          );
        }
        resolvedProfileId = mentor.id;
      }
    }

    return await this.sessionsService.getMySessions(
      resolvedRole,
      resolvedProfileId,
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Put(':id/status')
  async updateSessionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @Query('role') role?: string,
    @Query('profileId') profileId?: string,
  ) {
    // TODO: Extract role and profileId from authenticated user (req.user) once AuthModule is integrated.
    // For testing without auth, fallback to default mentor or student based on update status
    let resolvedRole = role;
    let resolvedProfileId = profileId ? Number(profileId) : null;

    if (!resolvedRole) {
      resolvedRole = dto.status === 'COMPLETED' ? 'mentor' : 'student';
    }

    if (!resolvedProfileId) {
      const session = await this.prisma.reviewSession.findUnique({
        where: { id },
      });
      if (!session) {
        throw new NotFoundException(`Session with ID ${id} not found.`);
      }
      resolvedProfileId =
        resolvedRole.toLowerCase() === 'mentor'
          ? session.mentorId
          : session.studentId;
    }

    const updatedSession = await this.sessionsService.updateSessionStatus(
      id,
      dto,
      resolvedRole,
      resolvedProfileId,
    );

    return {
      success: true,
      message: `Session status updated successfully to ${dto.status}`,
      data: updatedSession,
    };
  }

  @Get(':id/audit')
  async getSessionAudit(@Param('id', ParseIntPipe) id: number) {
    return await this.sessionsService.getSessionAudit(id);
  }
}
