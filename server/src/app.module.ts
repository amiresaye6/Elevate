import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { MentorsModule } from './mentors/mentors.module';
import { SessionsModule } from './sessions/sessions.module';
import { AvailabilityModule } from './availability/availability.module';
import { StacksModule } from './stacks/stacks.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    StudentsModule,
    MentorsModule,
    SessionsModule,
    AvailabilityModule,
    StacksModule,
    AdminModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
