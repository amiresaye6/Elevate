import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { QueueService } from '../email/queue.service';
import { EmailService } from '../email/email.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly queueService: QueueService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // If Mentor, validate stack existence
    if (dto.role === Role.MENTOR) {
      if (!dto.stackId) {
        throw new BadRequestException('Stack is required for Mentors');
      }
      const stack = await this.prisma.stack.findUnique({
        where: { id: dto.stackId },
      });
      if (!stack) {
        throw new NotFoundException('Selected stack does not exist');
      }
    }

    // Database transaction to create user and profile
    await this.prisma.$transaction(async (prismaClient) => {
      const user = await prismaClient.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: dto.role,
        },
      });

      if (dto.role === Role.STUDENT) {
        await prismaClient.studentProfile.create({
          data: {
            userId: user.id,
            name: dto.name,
          },
        });
      } else if (dto.role === Role.MENTOR) {
        await prismaClient.mentorProfile.create({
          data: {
            userId: user.id,
            name: dto.name,
            title: dto.title || '',
            bio: dto.bio || '',
            stackId: dto.stackId!,
            hourlyRate: dto.hourlyRate || 0,
          },
        });
      }
    });

    // Queue welcome email
    const welcomeHtml = this.emailService.getWelcomeTemplate(dto.name);
    await this.queueService.queueEmail(
      dto.email,
      'Welcome to Elivate!',
      welcomeHtml,
    );

    return {
      success: true,
      message: 'User registered successfully',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        studentProfile: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isBlocked) {
      throw new ForbiddenException('Your account has been blocked by administrators');
    }

    if (!user.password) {
      throw new UnauthorizedException('Please sign in using your Google account');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    // Get user details
    const userName =
      user.role === Role.STUDENT
        ? user.studentProfile?.name
        : user.role === Role.MENTOR
          ? user.mentorProfile?.name
          : 'Administrator';

    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: userName,
        },
      },
    };
  }

  async getProfile(userId: number, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        mentorProfile: {
          include: {
            stack: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profileData: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    };

    if (role === Role.STUDENT) {
      profileData.name = user.studentProfile?.name;
      profileData.profile = user.studentProfile;
    } else if (role === Role.MENTOR) {
      profileData.name = user.mentorProfile?.name;
      profileData.title = user.mentorProfile?.title;
      profileData.bio = user.mentorProfile?.bio;
      profileData.hourlyRate = user.mentorProfile?.hourlyRate;
      profileData.stackId = user.mentorProfile?.stackId;
      profileData.stack = user.mentorProfile?.stack;
      profileData.profile = user.mentorProfile;
    } else if (role === Role.ADMIN) {
      profileData.name = 'Administrator';
    }

    return {
      success: true,
      data: profileData,
    };
  }

  async updateProfile(userId: number, role: Role, dto: UpdateProfileDto) {
    if (role === Role.STUDENT) {
      if (dto.name) {
        await this.prisma.studentProfile.update({
          where: { userId },
          data: { name: dto.name },
        });
      }
    } else if (role === Role.MENTOR) {
      const updateData: any = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.bio !== undefined) updateData.bio = dto.bio;
      if (dto.hourlyRate !== undefined) updateData.hourlyRate = dto.hourlyRate;
      if (dto.stackId !== undefined) {
        const stack = await this.prisma.stack.findUnique({
          where: { id: dto.stackId },
        });
        if (!stack) {
          throw new NotFoundException('Selected stack does not exist');
        }
        updateData.stackId = dto.stackId;
      }

      await this.prisma.mentorProfile.update({
        where: { userId },
        data: updateData,
      });
    }

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException(
        'OAuth accounts do not have a password set. Please use forgot password to set a new password.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect current password');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        studentProfile: true,
        mentorProfile: true,
      },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExp = new Date(Date.now() + 3600000); 

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExp,
        },
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      const resetHtml = this.emailService.getResetPasswordTemplate(resetLink);

      await this.queueService.queueEmail(
        user.email,
        'Reset Your Password - Elivate',
        resetHtml,
      );
    }

    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExp: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async googleOAuth(code: string) {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRIT,
        redirect_uri: process.env.GOOGLE_OAUTH_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      this.logger.error(`Failed to exchange Google OAuth code: ${errorText}`);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }

    const tokenData = (await tokenResponse.json()) as any;
    const access_token = tokenData.access_token;
    const id_token = tokenData.id_token;


    const userinfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      },
    );

    if (!userinfoResponse.ok) {
      const errorText = await userinfoResponse.text();
      this.logger.error(`Failed to fetch Google userinfo: ${errorText}`);
      throw new UnauthorizedException('Failed to fetch Google user info');
    }

    const profile = (await userinfoResponse.json()) as any;

   
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
      include: {
        studentProfile: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(20).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          password: hashedPassword,
          role: Role.STUDENT,
          authProvider: 'google',
          googleId: profile.id,
          profilePicture: profile.picture || null,
          studentProfile: {
            create: {
              name: profile.name || 'Google User',
            },
          },
        },
        include: {
          studentProfile: true,
          mentorProfile: true,
        },
      });

      
      try {
        const welcomeHtml = this.emailService.getWelcomeTemplate(profile.name || 'Google User');
        await this.queueService.queueEmail(
          user.email,
          'Welcome to Elivate!',
          welcomeHtml,
        );
      } catch (emailError: any) {
        this.logger.error(`Failed to send welcome email for Google user: ${emailError.message}`);
      }
    } else {
     
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.id,
            authProvider: 'google',
            profilePicture: profile.picture || user.profilePicture,
          },
          include: {
            studentProfile: true,
            mentorProfile: true,
          },
        });
      }
    }

    if (user.isBlocked) {
      throw new ForbiddenException('Your account has been blocked by administrators');
    }


    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    const userName =
      user.role === Role.STUDENT
        ? user.studentProfile?.name
        : user.role === Role.MENTOR
          ? user.mentorProfile?.name
          : 'Administrator';

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: userName,
      },
    };
  }
}

