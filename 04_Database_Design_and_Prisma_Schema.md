# Academic Mentorship Platform

# Database Design & Prisma Schema

## NestJS + Prisma + MySQL

---

# Table of Contents

1. Database Overview
2. Design Principles
3. Entity Relationship Diagram
4. Tables Overview
5. Relationships
6. Indexing Strategy
7. Constraints & Integrity Rules
8. Prisma Schema
9. Migration Order
10. Transaction Design
11. Booking Isolation Strategy
12. Seed Data Strategy
13. Performance Considerations

---

# 1. Database Overview

Database Engine

```text
MySQL 8+
```

ORM

```text
Prisma
```

Database Name

```text
academic_mentorship
```

---

# 2. Design Principles

The database must satisfy:

* Data consistency
* Referential integrity
* Transaction safety
* Booking concurrency protection
* Audit logging
* Role-based authentication

Key Requirements:

✅ No orphan records

✅ No duplicated emails

✅ No double bookings

✅ No mentor without stack

✅ No session without mentor

✅ No session without student

✅ Audit logs linked to sessions

---

# 3. Entity Relationship Diagram

```text
User
 │
 ├── StudentProfile (1:1)
 │
 └── MentorProfile (1:1)
            │
            │
            ▼
         Stack
          (N:1)

MentorProfile
      │
      │
      ▼
MentorAvailability
     (1:N)

StudentProfile
      │
      │
      ▼
ReviewSession
      ▲
      │
MentorProfile

ReviewSession
      │
      │
      ▼
SessionAuditLog
      (1:1)
```

---

# 4. Tables Overview

## User

Central authentication table.

Stores:

* Login credentials
* Role information
* Account status

---

## StudentProfile

Stores student-specific information.

Linked to:

```text
User (1:1)
```

---

## MentorProfile

Stores mentor-specific information.

Linked to:

```text
User (1:1)

Stack (N:1)
```

---

## Stack

Stores technical categories.

Examples:

* React
* Node.js
* DevOps
* System Design
* Python

---

## MentorAvailability

Stores mentor weekly schedules.

Examples:

Monday

09:00 → 17:00

---

## ReviewSession

Stores booked review sessions.

Central business entity.

---

## SessionAuditLog

Stores AI/Classification results.

Linked to session.

---

# 5. Relationships

---

## User ↔ StudentProfile

Relationship

```text
1 : 1
```

Rules

One student profile per user.

One user per student profile.

---

## User ↔ MentorProfile

Relationship

```text
1 : 1
```

Rules

One mentor profile per user.

One user per mentor profile.

---

## Stack ↔ MentorProfile

Relationship

```text
1 : N
```

Rules

One stack contains many mentors.

Mentor belongs to exactly one stack.

---

## Mentor ↔ Availability

Relationship

```text
1 : N
```

Rules

Mentor can create multiple availability entries.

---

## Mentor ↔ Session

Relationship

```text
1 : N
```

Rules

Mentor can host many sessions.

Session must belong to one mentor.

---

## Student ↔ Session

Relationship

```text
1 : N
```

Rules

Student can create many sessions.

Session belongs to one student.

---

## Session ↔ AuditLog

Relationship

```text
1 : 1
```

Rules

One audit record per session.

Audit cannot exist without session.

---

# 6. Indexing Strategy

Indexes improve search performance.

---

## User

```sql
email UNIQUE
```

Purpose

Fast login lookup.

---

## MentorProfile

```sql
stackId INDEX
```

Purpose

Filter by stack.

---

```sql
averageRating INDEX
```

Purpose

Sort mentors.

---

## ReviewSession

```sql
mentorId INDEX
```

Purpose

Availability calculations.

---

```sql
studentId INDEX
```

Purpose

Student dashboard.

---

```sql
status INDEX
```

Purpose

Session filtering.

---

```sql
startTime INDEX
```

Purpose

Date searching.

---

# 7. Constraints & Integrity Rules

---

## User Email

```sql
UNIQUE
```

No duplicate accounts.

---

## Student Profile

```sql
UNIQUE(userId)
```

One student profile only.

---

## Mentor Profile

```sql
UNIQUE(userId)
```

One mentor profile only.

---

## Session Audit

```sql
UNIQUE(sessionId)
```

One audit per session.

---

## Foreign Keys

All foreign keys must be enforced.

No nullable relationships except:

```text
evaluationNotes
errorMessage
```

---

# 8. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  MENTOR
  STUDENT
}

enum SessionStatus {
  SCHEDULED
  COMPLETED
  CANCELED
}

model User {
  id              Int              @id @default(autoincrement())
  email           String           @unique
  password        String
  role            Role
  isBlocked       Boolean          @default(false)
  createdAt       DateTime         @default(now())

  studentProfile  StudentProfile?
  mentorProfile   MentorProfile?
}

model StudentProfile {
  id          Int             @id @default(autoincrement())
  userId      Int             @unique
  name        String
  createdAt   DateTime        @default(now())

  user         User           @relation(fields: [userId], references: [id])

  sessions     ReviewSession[]
}

model Stack {
  id           Int             @id @default(autoincrement())
  name         String          @unique
  description  String

  mentors      MentorProfile[]
}

model MentorProfile {
  id              Int                  @id @default(autoincrement())
  userId          Int                  @unique
  stackId         Int

  name            String
  title           String
  bio             String

  isVerified      Boolean              @default(false)

  averageRating   Float                @default(0)

  hourlyRate      Decimal              @db.Decimal(10,2)

  user            User                 @relation(fields: [userId], references: [id])

  stack           Stack                @relation(fields: [stackId], references: [id])

  availability    MentorAvailability[]

  sessions        ReviewSession[]
}

model MentorAvailability {
  id           Int      @id @default(autoincrement())

  mentorId     Int

  dayOfWeek    String

  startTime    String

  endTime      String

  mentor       MentorProfile
               @relation(fields: [mentorId], references: [id])
}

model ReviewSession {
  id                 Int                @id @default(autoincrement())

  mentorId           Int

  studentId          Int

  startTime          DateTime

  endTime            DateTime

  description        String

  status             SessionStatus

  evaluationNotes    String?

  mentor             MentorProfile
                     @relation(fields: [mentorId], references: [id])

  student            StudentProfile
                     @relation(fields: [studentId], references: [id])

  auditLog           SessionAuditLog?
}

model SessionAuditLog {
  id                 Int          @id @default(autoincrement())

  sessionId          Int          @unique

  predictedTag       String

  confidenceScore    Float

  status             String

  latencyMs          Int

  errorMessage       String?

  session            ReviewSession
                     @relation(fields: [sessionId], references: [id])
}
```

---

# 9. Migration Order

Create tables in this order:

```text
User

Stack

StudentProfile

MentorProfile

MentorAvailability

ReviewSession

SessionAuditLog
```

Reason:

Foreign key dependencies.

---

# 10. Transaction Design

Critical operations must use Prisma transactions.

---

## Required Transactions

### Booking Session

```text
Create Session

Create Audit Log

Commit
```

---

### Failure Case

```text
Create Session

Audit Fails

Rollback
```

Result:

No session created.

---

# 11. Booking Isolation Strategy

When booking:

Calculate

```text
endTime = startTime + 45 minutes
```

Check existing sessions.

Conflict exists if:

```text
newStart < existingEnd

AND

newEnd > existingStart
```

If true:

```text
409 Conflict
```

Response

```json
{
  "success": false,
  "message": "Time slot already booked"
}
```

---

# 12. Seed Data Strategy

Initial stacks:

```text
React

Node.js

NestJS

Angular

Python

Django

FastAPI

System Design

DevOps

Database Design
```

---

Default Admin

```json
{
  "email": "admin@platform.com",
  "password": "Admin123!"
}
```

Password must be hashed.

---

# 13. Performance Considerations

Mentor Search

Must support:

* Pagination
* Sorting
* Filtering

Use database queries.

Never filter large datasets in memory.

---

Availability Lookup

Must calculate only requested date.

Do not load all mentor sessions.

---

Dashboard Statistics

Use aggregate queries.

Example:

```sql
COUNT(*)

AVG()

GROUP BY
```

instead of loading records and counting in JavaScript.

---

# Database Definition of Done

Database layer is complete when:

✅ Prisma schema finalized

✅ Migrations created

✅ MySQL connected

✅ Foreign keys working

✅ Indexes created

✅ Seed data exists

✅ Transactions implemented

✅ Double booking prevented

✅ Audit logging implemented

✅ Prisma Client generated

✅ Swagger reflects schema

✅ Backend team approved
