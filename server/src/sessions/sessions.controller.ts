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
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { BookSessionDto } from './dto/book-session.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('book')
  async bookSession(
    @CurrentUser() user: { id: number; email: string; role: Role },
    @Body() dto: BookSessionDto,
  ) {
    if (user.role !== Role.STUDENT) {
      throw new ForbiddenException('Only students can book sessions.');
    }

    // Resolve student profile from user id
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });
    if (!student) {
      throw new NotFoundException('Student profile not found.');
    }

    dto.studentId = student.id;
    return await this.sessionsService.bookSession(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMySessions(
    @CurrentUser() user: { id: number; email: string; role: Role },
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    let resolvedProfileId: number;
    let resolvedRole: string;

    if (user.role === Role.STUDENT) {
      resolvedRole = 'student';
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });
      if (!student) {
        throw new NotFoundException('Student profile not found.');
      }
      resolvedProfileId = student.id;
    } else if (user.role === Role.MENTOR) {
      resolvedRole = 'mentor';
      const mentor = await this.prisma.mentorProfile.findUnique({
        where: { userId: user.id },
      });
      if (!mentor) {
        throw new NotFoundException('Mentor profile not found.');
      }
      resolvedProfileId = mentor.id;
    } else {
      throw new ForbiddenException(
        'Administrators cannot view session history.',
      );
    }

    return await this.sessionsService.getMySessions(
      resolvedRole,
      resolvedProfileId,
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSessionById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; email: string; role: Role },
  ) {
    const sessionRes = await this.sessionsService.getSessionById(id);
    const session = sessionRes.data;

    // Access check: Only the booking student, assigned mentor, or admin can view details
    if (user.role === Role.STUDENT) {
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });
      if (!student || session.studentId !== student.id) {
        throw new ForbiddenException(
          'You are not authorized to view this session.',
        );
      }
    } else if (user.role === Role.MENTOR) {
      const mentor = await this.prisma.mentorProfile.findUnique({
        where: { userId: user.id },
      });
      if (!mentor || session.mentorId !== mentor.id) {
        throw new ForbiddenException(
          'You are not authorized to view this session.',
        );
      }
    }

    return sessionRes;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  async updateSessionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: { id: number; email: string; role: Role },
  ) {
    let resolvedProfileId: number;
    let resolvedRole: string;

    if (user.role === Role.STUDENT) {
      resolvedRole = 'student';
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });
      if (!student) {
        throw new NotFoundException('Student profile not found.');
      }
      resolvedProfileId = student.id;
    } else if (user.role === Role.MENTOR) {
      resolvedRole = 'mentor';
      const mentor = await this.prisma.mentorProfile.findUnique({
        where: { userId: user.id },
      });
      if (!mentor) {
        throw new NotFoundException('Mentor profile not found.');
      }
      resolvedProfileId = mentor.id;
    } else {
      throw new ForbiddenException(
        'Administrators cannot modify session status.',
      );
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

  @UseGuards(JwtAuthGuard)
  @Get(':id/audit')
  async getSessionAudit(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; email: string; role: Role },
  ) {
    const session = await this.prisma.reviewSession.findUnique({
      where: { id },
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found.`);
    }

    // Access check: Only the booking student, assigned mentor, or admin can view audit tags
    if (user.role === Role.STUDENT) {
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });
      if (!student || session.studentId !== student.id) {
        throw new ForbiddenException(
          'You are not authorized to view this session audit.',
        );
      }
    } else if (user.role === Role.MENTOR) {
      const mentor = await this.prisma.mentorProfile.findUnique({
        where: { userId: user.id },
      });
      if (!mentor || session.mentorId !== mentor.id) {
        throw new ForbiddenException(
          'You are not authorized to view this session audit.',
        );
      }
    }

    return await this.sessionsService.getSessionAudit(id);
  }
}
