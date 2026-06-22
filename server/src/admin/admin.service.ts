import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateUserStatus(newStatus: boolean, userId: number) {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: { isBlocked: newStatus },
      });
      return updatedUser;
    } catch (error: any) {
      if (error.code == 'P2025') {
        throw new NotFoundException(`user with id=${userId} not found`);
      }
    }
  }

  async getAllSessions(page: number) {
    const [sessions, totalItems] = await Promise.all([
      this.prismaService.reviewSession.findMany({
        skip: (page - 1) * 10,
        take: 10,
      }),
      this.prismaService.sessionAuditLog.count(),
    ]);

    const totalPages = Math.ceil(totalItems / 10);
    if (page && page > totalPages && totalPages > 0) {
      throw new NotFoundException(
        `page not found. max page number = ${totalPages}`,
      );
    }
    const pagination = { page, limit: 10, totalItems, totalPages };

    return { sessions, pagination };
  }

  async getUsersCount() {
    const usersCount = await this.prismaService.user.count();
    return usersCount;
  }

  async getMentorsCount() {
    const mentorsCount = await this.prismaService.user.count({
      where: { role: 'MENTOR' },
    });
    return mentorsCount;
  }

  async getStudentsCount() {
    const studentsCount = await this.prismaService.user.count({
      where: { role: 'STUDENT' },
    });
    return studentsCount;
  }

  async getSessionsCount() {
    const sessionsCount = await this.prismaService.reviewSession.count();
    return sessionsCount;
  }

  async getDasboard() {
    const [usersCount, mentorsCount, studentsCount, sessionCount] =
      await Promise.all([
        this.getUsersCount(),
        this.getMentorsCount(),
        this.getStudentsCount(),
        this.getSessionsCount(),
      ]);
    return { usersCount, mentorsCount, studentsCount, sessionCount };
  }

  async getNeedVerification(page: number) {
    try {
      const [mentors, totalItems] = await Promise.all([
        this.prismaService.mentorProfile.findMany({
          where: { isVerified: false },
          skip: (page - 1) * 10,
          take: 10,
        }),
        this.prismaService.stack.count(),
      ]);
      const totalPages = Math.ceil(totalItems / 10);
      if (page && page > totalPages && totalPages > 0) {
        throw new NotFoundException(
          `page not found. max page number = ${totalPages}`,
        );
      }
      const pagination = { page, limit: 10, totalItems, totalPages };
      return { mentors, pagination };
    } catch (error) {
      throw new BadRequestException('an error occured');
    }
  }

  async verifyMentor(id: number) {
    try {
      const mentor = await this.prismaService.mentorProfile.update({
        where: { id },
        data: { isVerified: true },
      });
      return mentor;
    } catch (error: any) {
      throw new BadRequestException('an error occured');
    }
  }
}
