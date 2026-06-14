# Academic Mentorship Platform

# Backend API Specification

## NestJS + Prisma + MySQL

---

# Table Of Contents

1. API Standards
2. Authentication
3. Authorization
4. Database Models
5. Endpoint Specifications
6. Validation Rules
7. Pagination Standards
8. Booking Concurrency Rules
9. Audit Log Rules
10. Error Handling

---

# 1. API Standards

Base URL

```text
/api
```

---

## Success Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

---

## Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

---

# 2. Authentication

Authentication Method

JWT Bearer Token

Header

```http
Authorization: Bearer JWT_TOKEN
```

Token Expiration

```text
24 Hours
```

---

# 3. Authorization

Roles

```text
ADMIN
MENTOR
STUDENT
```

---

## Route Protection

| Route Type | Access   |
| ---------- | -------- |
| Public     | Everyone |
| Student    | Student  |
| Mentor     | Mentor   |
| Admin      | Admin    |

---

# 4. Database Models

---

## User

```ts
id: number
email: string
password: string
role: UserRole
createdAt: Date
```

---

## StudentProfile

```ts
id: number
userId: number
name: string
createdAt: Date
```

---

## MentorProfile

```ts
id: number
userId: number
stackId: number
name: string
title: string
bio: string
isVerified: boolean
averageRating: number
hourlyRate: number
```

---

## Stack

```ts
id: number
name: string
description: string
```

---

## MentorAvailability

```ts
id: number
mentorId: number
dayOfWeek: string
startTime: string
endTime: string
```

---

## ReviewSession

```ts
id: number
mentorId: number
studentId: number
startTime: Date
endTime: Date
description: string
status: SessionStatus
evaluationNotes: string
```

---

## SessionAuditLog

```ts
id: number
sessionId: number
predictedTag: string
confidenceScore: number
status: string
latencyMs: number
errorMessage: string
```

---

# 5. ENDPOINTS

---

# AUTH MODULE

---

## Register User

POST

```http
/api/auth/register
```

Access

Public

---

### Request

```json
{
  "email": "john@example.com",
  "password": "Password123",
  "role": "STUDENT",
  "name": "John Doe"
}
```

---

### Mentor Request

```json
{
  "email": "mentor@example.com",
  "password": "Password123",
  "role": "MENTOR",
  "name": "Ahmed Ali",
  "title": "Senior React Engineer",
  "bio": "8 years experience",
  "stackId": 1
}
```

---

### Success

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

### Validation

Email:

* Required
* Valid format
* Unique

Password:

* Required
* Min 8 characters

Role:

* Required

---

## Login

POST

```http
/api/auth/login
```

---

### Request

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

---

### Success

```json
{
  "success": true,
  "data": {
    "accessToken": "JWT",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "STUDENT"
    }
  }
}
```

---

## Profile

GET

```http
/api/auth/profile
```

Authorization

Required

---

# STACK MODULE

---

## Get All Stacks

GET

```http
/api/stacks
```

---

### Success

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "React",
      "description": "Frontend Development"
    }
  ]
}
```

---

## Create Stack

POST

```http
/api/stacks
```

Access

ADMIN

---

### Request

```json
{
  "name": "DevOps",
  "description": "Infrastructure Engineering"
}
```

---

## Update Stack

PUT

```http
/api/stacks/:id
```

Access

ADMIN

---

## Delete Stack

DELETE

```http
/api/stacks/:id
```

Access

ADMIN

---

# MENTOR MODULE

---

## Get Mentors

GET

```http
/api/mentors
```

---

### Query Parameters

```http
?keyword=react
&stack=1
&sortBy=rating
&page=1
&limit=10
```

---

### Success

```json
{
  "success": true,
  "data": [],
  "pagination": {}
}
```

---

## Get Mentor Details

GET

```http
/api/mentors/:id
```

---

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ahmed",
    "title": "Senior React Engineer",
    "bio": "..."
  }
}
```

---

## Get Mentor Availability

GET

```http
/api/mentors/:id/availability
```

---

### Query

```http
?date=2026-08-15
```

---

### Response

```json
{
  "success": true,
  "data": [
    {
      "start": "10:00",
      "end": "10:45"
    }
  ]
}
```

---

# AVAILABILITY MODULE

---

## Create Availability

POST

```http
/api/availability
```

Access

MENTOR

---

### Request

```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "17:00"
}
```

---

## Update Availability

PUT

```http
/api/availability/:id
```

---

## Delete Availability

DELETE

```http
/api/availability/:id
```

---

# SESSION MODULE

---

## Book Session

POST

```http
/api/sessions/book
```

Access

STUDENT

---

### Request

```json
{
  "mentorId": 1,
  "startTime": "2026-08-15T10:00:00",
  "description": "Need help reviewing React architecture."
}
```

---

### Backend Logic

1. Verify mentor exists

2. Verify mentor approved

3. Verify slot available

4. Create session

5. Generate audit log

6. Commit transaction

---

### Success

```json
{
  "success": true,
  "message": "Session booked successfully"
}
```

---

## Get My Sessions

GET

```http
/api/sessions
```

Access

Student

---

### Query

```http
?status=SCHEDULED
&page=1
```

---

## Update Session Status

PUT

```http
/api/sessions/:id/status
```

---

### Request

```json
{
  "status": "COMPLETED",
  "evaluationNotes": "Strong React fundamentals."
}
```

---

### Access

MENTOR

---

## Session Audit

GET

```http
/api/sessions/:id/audit
```

---

### Response

```json
{
  "success": true,
  "data": {
    "predictedTag": "React",
    "confidenceScore": 0.94,
    "status": "SUCCESS"
  }
}
```

---

# ADMIN MODULE

---

## Get All Users

GET

```http
/api/admin/users
```

Access

ADMIN

---

## Update User Status

PUT

```http
/api/admin/users/:id/status
```

---

### Request

```json
{
  "isBlocked": true
}
```

---

## Get All Sessions

GET

```http
/api/admin/sessions
```

---

## Dashboard Statistics

GET

```http
/api/admin/dashboard
```

---

### Response

```json
{
  "success": true,
  "data": {
    "users": 120,
    "mentors": 20,
    "students": 100,
    "sessions": 430
  }
}
```

---

# 6. VALIDATION RULES

Email

* Required
* Unique
* Valid format

Password

* Min 8 chars

Name

* Min 3 chars

Bio

* Max 1000 chars

Description

* Min 20 chars

Hourly Rate

* Positive number

---

# 7. PAGINATION STANDARD

Every list endpoint returns:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

---

# 8. CONCURRENCY RULE

Prevent double booking.

Booking rejected when:

```text
newStart < existingEnd

AND

newEnd > existingStart
```

Must execute inside database transaction.

---

# 9. AUDIT LOG RULE

When booking succeeds:

Create Session

↓

Run Classifier

↓

Create Audit Log

↓

Commit Transaction

If Audit Log fails

Rollback Session

---

# 10. DEFINITION OF DONE

Endpoint complete when:

✅ DTO Exists

✅ Validation Exists

✅ Swagger Exists

✅ Service Exists

✅ Authorization Exists

✅ Error Handling Exists

✅ Response Format Matches Spec

✅ Tested in Postman

✅ Documented
