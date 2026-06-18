import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(mentorId: number) {
    const mentor = await this.prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: {
        stack: true,
        availability: true,
        sessions: {
          include: { student: { select: { name: true } } },
          orderBy: { startTime: 'desc' },
          take: 5,
        },
      },
    });

    if (!mentor) {
      throw new NotFoundException(`Mentor profile #${mentorId} not found`);
    }

    // Aggregate stats
    const totalSessions = await this.prisma.reviewSession.count({
      where: { mentorId },
    });
    const completedSessions = await this.prisma.reviewSession.count({
      where: { mentorId, status: 'COMPLETED' },
    });
    const upcomingSessions = await this.prisma.reviewSession.count({
      where: { mentorId, status: 'SCHEDULED' },
    });

    return {
      profile: {
        id: mentor.id,
        name: mentor.name,
        title: mentor.title,
        bio: mentor.bio,
        averageRating: mentor.averageRating,
        hourlyRate: mentor.hourlyRate,
        isVerified: mentor.isVerified,
        stack: mentor.stack,
      },
      stats: {
        totalSessions,
        completedSessions,
        upcomingSessions,
        availabilitySlots: mentor.availability.length,
      },
      recentSessions: mentor.sessions,
      availability: mentor.availability,
    };
  }
}
