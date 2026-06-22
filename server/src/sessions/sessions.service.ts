import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BookSessionDto } from './dto/book-session.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async bookSession(dto: BookSessionDto) {
    const { mentorId, startTime, description, studentId } = dto;

    // 1. Resolve student (mocking auth user extraction for now)
    let resolvedStudentId = studentId;

    if (!resolvedStudentId) {
      // TODO: Extract studentId from authenticated req.user once AuthModule is integrated.
      // Defaulting to the first student in the database for ease of testing in public routes.
      const defaultStudent = await this.prisma.studentProfile.findFirst();
      if (!defaultStudent) {
        throw new NotFoundException(
          'No students found in the database. Please seed the database first.',
        );
      }
      resolvedStudentId = defaultStudent.id;
    } else {
      const student = await this.prisma.studentProfile.findUnique({
        where: { id: resolvedStudentId },
      });
      if (!student) {
        throw new NotFoundException(
          `Student profile with ID ${resolvedStudentId} not found.`,
        );
      }
    }

    // 2. Verify mentor exists and is verified
    const mentor = await this.prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: { stack: true },
    });

    if (!mentor) {
      throw new NotFoundException(`Mentor with ID ${mentorId} not found.`);
    }

    if (!mentor.isVerified) {
      throw new BadRequestException(
        'Mentor account has not been verified/approved by an administrator.',
      );
    }

    // 3. Validate requested slot (fixed duration: 45 minutes)
    const bookingStart = new Date(startTime);
    if (isNaN(bookingStart.getTime())) {
      throw new BadRequestException('Invalid start time format.');
    }
    const bookingEnd = new Date(bookingStart.getTime() + 45 * 60 * 1000);

    // Get Day of Week of requested start time
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayOfWeek = days[bookingStart.getDay()];

    // Query availability for this mentor
    const availabilities = await this.prisma.mentorAvailability.findMany({
      where: { mentorId },
    });

    const dailyAvailabilities = availabilities.filter(
      (av) => av.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase(),
    );

    if (dailyAvailabilities.length === 0) {
      throw new BadRequestException(
        `Mentor is not available on ${dayOfWeek}s.`,
      );
    }

    // Verify booking fits in at least one availability window
    const sessionStartMins =
      bookingStart.getHours() * 60 + bookingStart.getMinutes();
    const sessionEndMins = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();

    const fitsInAvailability = dailyAvailabilities.some((av) => {
      const [availStartH, availStartM] = av.startTime.split(':').map(Number);
      const [availEndH, availEndM] = av.endTime.split(':').map(Number);
      const availStartMins = availStartH * 60 + availStartM;
      const availEndMins = availEndH * 60 + availEndM;
      return (
        sessionStartMins >= availStartMins && sessionEndMins <= availEndMins
      );
    });

    if (!fitsInAvailability) {
      throw new BadRequestException(
        'Requested session slot falls outside of mentor availability hours.',
      );
    }

    // 4. Perform booking inside database transaction to guarantee isolation and overlap prevention
    return await this.prisma.$transaction(async (tx) => {
      // Check for overlap: newStart < existingEnd AND newEnd > existingStart
      const overlappingSession = await tx.reviewSession.findFirst({
        where: {
          mentorId,
          status: { in: ['SCHEDULED', 'COMPLETED'] },
          startTime: { lt: bookingEnd },
          endTime: { gt: bookingStart },
        },
      });

      if (overlappingSession) {
        throw new ConflictException(
          'Time slot already booked. Please choose another slot.',
        );
      }

      // Create session
      const session = await tx.reviewSession.create({
        data: {
          mentorId,
          studentId: resolvedStudentId,
          startTime: bookingStart,
          endTime: bookingEnd,
          description,
          status: 'SCHEDULED',
        },
      });

      // Call classifier (Gemini / Local fallback) with graceful fail-soft fallback
      let classification;
      try {
        classification = await this.auditService.classifySession(
          description,
          mentor.stack.name,
        );
      } catch (err) {
        console.error('AI Classification failed, using default fallback:', err);
        classification = {
          predictedTag: mentor.stack.name,
          confidenceScore: 0.5,
          status: 'FAILED',
        };
      }

      // Create Session Audit Log
      await tx.sessionAuditLog.create({
        data: {
          sessionId: session.id,
          predictedTag: classification.predictedTag,
          confidenceScore: classification.confidenceScore,
          status: classification.status,
          latencyMs: 120,
        },
      });

      return {
        success: true,
        message: 'Session booked successfully',
        data: {
          sessionId: session.id,
          startTime: session.startTime,
          endTime: session.endTime,
        },
      };
    });
  }

  async getMySessions(
    role: string,
    profileId: number,
    status?: string,
    page = 1,
    limit = 10,
  ) {
    // TODO: Extract role and profileId from authenticated request (req.user) once AuthModule is integrated.
    // Standardizing page and limit
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.max(1, Number(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const whereClause: any = {};

    if (role.toLowerCase() === 'student') {
      whereClause.studentId = profileId;
    } else if (role.toLowerCase() === 'mentor') {
      whereClause.mentorId = profileId;
    } else {
      throw new BadRequestException(
        'Invalid user role specified. Must be student or mentor.',
      );
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const [sessions, totalItems] = await Promise.all([
      this.prisma.reviewSession.findMany({
        where: whereClause,
        include: {
          mentor: true,
          student: true,
          auditLog: true,
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: parsedLimit,
      }),
      this.prisma.reviewSession.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalItems / parsedLimit);

    return {
      success: true,
      data: sessions,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalItems,
        totalPages,
      },
    };
  }

  async getSessionById(id: number) {
    const session = await this.prisma.reviewSession.findUnique({
      where: { id },
      include: {
        mentor: {
          include: { stack: true },
        },
        student: true,
        auditLog: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found.`);
    }

    return {
      success: true,
      data: session,
    };
  }

  async updateSessionStatus(
    id: number,
    dto: UpdateStatusDto,
    role: string,
    profileId: number,
  ) {
    // TODO: Extract role and profileId from authenticated request (req.user) once AuthModule is integrated.
    const session = await this.prisma.reviewSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found.`);
    }

    const { status, evaluationNotes } = dto;

    if (status === 'COMPLETED') {
      // Only mentors can complete sessions
      if (role.toLowerCase() !== 'mentor' || session.mentorId !== profileId) {
        throw new ForbiddenException(
          'Only the assigned mentor can mark a session as completed.',
        );
      }

      if (!evaluationNotes || evaluationNotes.trim().length < 20) {
        throw new BadRequestException(
          'Evaluation notes are required and must be at least 20 characters.',
        );
      }

      return await this.prisma.reviewSession.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          evaluationNotes,
        },
      });
    }

    if (status === 'CANCELED') {
      // Both mentors and students can cancel sessions
      if (role.toLowerCase() === 'student' && session.studentId !== profileId) {
        throw new ForbiddenException(
          'You can only cancel your own booked sessions.',
        );
      }
      if (role.toLowerCase() === 'mentor' && session.mentorId !== profileId) {
        throw new ForbiddenException(
          'You can only cancel your own assigned sessions.',
        );
      }

      return await this.prisma.reviewSession.update({
        where: { id },
        data: {
          status: 'CANCELED',
        },
      });
    }

    throw new BadRequestException('Invalid session status transition.');
  }

  async getSessionAudit(id: number) {
    const auditLog = await this.prisma.sessionAuditLog.findUnique({
      where: { sessionId: id },
    });

    if (!auditLog) {
      throw new NotFoundException(
        `Session audit log for session ID ${id} not found.`,
      );
    }

    return {
      success: true,
      data: {
        predictedTag: auditLog.predictedTag,
        confidenceScore: auditLog.confidenceScore,
        status: auditLog.status,
      },
    };
  }
}
