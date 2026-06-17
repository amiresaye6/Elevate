import 'dotenv/config';
import { PrismaClient, Role, SessionStatus } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3309,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'elivate_db',
  allowPublicKeyRetrieval: true,
  connectionLimit: 10,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 0. Clean existing data (in correct order of dependencies)
  console.log('Cleaning existing database tables...');
  await prisma.sessionAuditLog.deleteMany({});
  await prisma.reviewSession.deleteMany({});
  await prisma.mentorAvailability.deleteMany({});
  await prisma.mentorProfile.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.stack.deleteMany({});

  console.log('Resetting database auto-increment counters...');
  await prisma.$executeRawUnsafe('ALTER TABLE SessionAuditLog AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE ReviewSession AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE MentorAvailability AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE MentorProfile AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE StudentProfile AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE User AUTO_INCREMENT = 1;');
  await prisma.$executeRawUnsafe('ALTER TABLE Stack AUTO_INCREMENT = 1;');

  // 1. Seed Stacks
  const stacksData = [
    { name: 'React', description: 'Frontend Library' },
    { name: 'Node.js', description: 'JavaScript Runtime' },
    { name: 'NestJS', description: 'Progressive Node.js Framework' },
    { name: 'Angular', description: 'Frontend Framework' },
    { name: 'Python', description: 'Programming Language' },
    { name: 'Django', description: 'Python Web Framework' },
    { name: 'FastAPI', description: 'Modern Python Web API' },
    { name: 'System Design', description: 'Software Architecture' },
    { name: 'DevOps', description: 'Infrastructure and Deployment' },
    { name: 'Database Design', description: 'Schema and Query Optimization' },
  ];

  const createdStacks: Record<string, any> = {};
  for (const stack of stacksData) {
    const s = await prisma.stack.create({
      data: stack,
    });
    createdStacks[s.name] = s;
  }
  console.log(`Seeded ${stacksData.length} technical stacks.`);

  // Common password hashing
  const defaultPassword = 'Password123!';
  const adminPassword = 'Admin123!';
  const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  // 2. Seed Default Admin User
  const adminEmail = 'admin@platform.com';
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedAdminPassword,
      role: Role.ADMIN,
      isBlocked: false,
    },
  });
  console.log(`Seeded default Admin user: ${adminEmail}`);

  // 3. Seed Students
  const studentsData = [
    { email: 'amir@platform.com', name: 'Amir Alsayed' },
    { email: 'maula@platform.com', name: 'Amir Maula' },
    { email: 'azzazy@platform.com', name: 'Mohamed Elazzazy' },
    { email: 'hager@platform.com', name: 'Hager Nofal' },
    { email: 'donia@platform.com', name: 'Donia Mohamed' },
  ];

  const createdStudents = [];
  for (const student of studentsData) {
    const u = await prisma.user.create({
      data: {
        email: student.email,
        password: hashedDefaultPassword,
        role: Role.STUDENT,
        studentProfile: {
          create: {
            name: student.name,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });
    createdStudents.push(u.studentProfile);
  }
  console.log(`Seeded ${studentsData.length} student profiles.`);

  // 4. Seed Mentors
  const mentorsData = [
    {
      email: 'mentor1@platform.com',
      name: 'Sarah Connor',
      title: 'Senior React Developer',
      bio: '5+ years developing awesome frontends with React and Redux.',
      isVerified: true,
      averageRating: 4.8,
      hourlyRate: 50.0,
      stackName: 'React',
      availabilities: [
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '17:00' },
      ],
    },
    {
      email: 'mentor2@platform.com',
      name: 'Bruce Wayne',
      title: 'NestJS Expert & System Architect',
      bio: 'Building scalable backend microservices and secure APIs.',
      isVerified: true,
      averageRating: 4.9,
      hourlyRate: 75.0,
      stackName: 'NestJS',
      availabilities: [
        { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '15:00' },
        { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '15:00' },
      ],
    },
    {
      email: 'mentor3@platform.com',
      name: 'Clark Kent',
      title: 'Python Developer',
      bio: 'Passionate about Django, FastAPI and Machine Learning.',
      isVerified: false,
      averageRating: 4.2,
      hourlyRate: 40.0,
      stackName: 'Python',
      availabilities: [
        { dayOfWeek: 'Friday', startTime: '08:00', endTime: '12:00' },
      ],
    },
  ];

  const createdMentors = [];
  for (const mentor of mentorsData) {
    const stack = createdStacks[mentor.stackName];
    if (!stack) continue;

    const u = await prisma.user.create({
      data: {
        email: mentor.email,
        password: hashedDefaultPassword,
        role: Role.MENTOR,
        mentorProfile: {
          create: {
            name: mentor.name,
            title: mentor.title,
            bio: mentor.bio,
            isVerified: mentor.isVerified,
            averageRating: mentor.averageRating,
            hourlyRate: mentor.hourlyRate,
            stackId: stack.id,
            availability: {
              create: mentor.availabilities,
            },
          },
        },
      },
      include: {
        mentorProfile: {
          include: {
            availability: true,
          },
        },
      },
    });
    createdMentors.push(u.mentorProfile);
  }
  console.log(
    `Seeded ${mentorsData.length} mentor profiles with availabilities.`,
  );

  // 5. Seed Review Sessions and Audit Logs
  if (createdStudents.length >= 3 && createdMentors.length >= 2) {
    const s1 = createdStudents[0]!;
    const s2 = createdStudents[1]!;
    const s3 = createdStudents[2]!;
    const m1 = createdMentors[0]!;
    const m2 = createdMentors[1]!;

    // Session 1: Completed React Review Session
    await prisma.reviewSession.create({
      data: {
        mentorId: m1.id,
        studentId: s1.id,
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        endTime: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
        ), // + 45 mins
        description: 'React context and Redux state management review',
        status: SessionStatus.COMPLETED,
        evaluationNotes: 'Excellent student, grasped the concepts quickly.',
        auditLog: {
          create: {
            predictedTag: 'Technical/React',
            confidenceScore: 0.95,
            status: 'PASSED',
            latencyMs: 120,
          },
        },
      },
    });

    // Session 2: Completed NestJS Session
    await prisma.reviewSession.create({
      data: {
        mentorId: m2.id,
        studentId: s2.id,
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        endTime: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
        ), // + 45 mins
        description: 'Dependency injection and Prisma integration in NestJS',
        status: SessionStatus.COMPLETED,
        evaluationNotes:
          'Reviewed architecture patterns. Needs practice with migrations.',
        auditLog: {
          create: {
            predictedTag: 'Technical/NestJS',
            confidenceScore: 0.98,
            status: 'PASSED',
            latencyMs: 145,
          },
        },
      },
    });

    // Session 3: Future Scheduled Session
    await prisma.reviewSession.create({
      data: {
        mentorId: m2.id,
        studentId: s1.id,
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        endTime: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
        ),
        description: 'Discussing database normalization and indexing in MySQL',
        status: SessionStatus.SCHEDULED,
      },
    });

    // Session 4: Canceled Session
    await prisma.reviewSession.create({
      data: {
        mentorId: m1.id,
        studentId: s3.id,
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        endTime: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
        ),
        description: 'Tailwind CSS setup with shadcn',
        status: SessionStatus.CANCELED,
        evaluationNotes:
          'Student requested cancellation due to scheduling conflict.',
      },
    });

    console.log('Seeded 4 sample review sessions and audit logs.');
  }

  console.log('Database seeding completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
