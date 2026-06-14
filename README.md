# Academic Mentorship Platform

### ITI React + NestJS Final Project

> A full-stack role-based mentorship and technical review platform where Students can discover Mentors, schedule code review sessions, receive evaluations, and track their learning progress. Mentors manage availability and review sessions, while Administrators maintain platform integrity through moderation and configuration management.

---

# Table of Contents

1. Project Overview
2. Project Goals
3. Team Members & Responsibilities
4. Technology Stack
5. System Architecture
6. User Roles
7. Core Business Rules
8. Application Routes
9. Project Folder Structure
10. Development Workflow
11. Git Strategy
12. Coding Standards
13. Team Ownership Matrix
14. Sprint Plan
15. Definition of Done

---

# 1. Project Overview

The Academic Mentorship Platform is designed to connect Students with Mentors specializing in different technical domains.

Students can:

* Search mentors
* Filter mentors by technology stack
* Book review sessions
* Manage bookings
* View evaluations

Mentors can:

* Configure availability
* Manage sessions
* Review student submissions
* Add evaluation notes

Administrators can:

* Approve mentor accounts
* Manage users
* Manage technology stacks
* Monitor platform activity

---

# 2. Project Goals

The objective of this project is to demonstrate:

* React SPA architecture
* NestJS backend architecture
* Authentication & Authorization
* Role-Based Access Control (RBAC)
* State Management
* API Integration
* Relational Database Design
* Team Collaboration
* Git Workflow
* Production-ready UI practices

---

# 3. Team Members & Responsibilities

| Team Member      | Role                   | Primary Responsibility                 |
| ---------------- | ---------------------- | -------------------------------------- |
| Amir Alsayed     | Backend Lead           | Architecture, Authentication, Database |
| Amir Maula       | Student Module Lead    | Search, Booking, Student Dashboard     |
| Mohamed Elazazzy | Mentor Module Lead     | Mentor Dashboard, Availability         |
| Hager Noral      | Admin Module Lead      | User Management, Stack Management      |
| Donia Mohamed    | UI Infrastructure Lead | Shared Components, Theme, RTL          |

---

# 4. Technology Stack

## Frontend

* React
* Vite
* React Router DOM
* Redux Toolkit
* Axios
* React Query
* Tailwind CSS
* React Hook Form
* Zod
* React Hot Toast
* i18next

## Backend

* NestJS
* Prisma ORM
* MySQL
* JWT
* Passport
* Swagger
* Class Validator

## Dev Tools

* GitHub
* Postman
* Figma
* Vercel
* Railway / Render

---

# 5. System Architecture

Frontend Layer

React SPA

↓

API Layer

NestJS REST API

↓

ORM Layer

Prisma

↓

Database Layer

MySQL

---

# 6. User Roles

## Student

Permissions:

* Register
* Login
* Browse mentors
* Filter mentors
* Book sessions
* Cancel sessions
* View evaluations
* Update profile

---

## Mentor

Permissions:

* Login
* Manage profile
* Manage availability
* View booked sessions
* Write evaluations
* Update session status

---

## Admin

Permissions:

* Manage users
* Approve mentors
* Block users
* Manage technology stacks
* View all sessions

---

# 7. Core Business Rules

## Authentication

* All protected endpoints require JWT.
* JWT must be included in Authorization header.
* Users must only access their permitted routes.

---

## Session Booking

Session duration is fixed:

45 minutes

A student cannot book an occupied slot.

Overlap rule:

New booking is invalid when:

newStart < existingEnd

AND

newEnd > existingStart

---

## Mentor Approval

Mentors cannot appear in search results until approved by Admin.

---

## Session Audit

Every booking automatically generates an audit log.

If audit generation fails:

* Session creation fails
* Transaction is rolled back

---

# 8. Application Routes

## Public Routes

| Route       | Description      |
| ----------- | ---------------- |
| /           | Landing Page     |
| /login      | Login            |
| /register   | Register         |
| /mentors    | Mentor Discovery |
| /mentor/:id | Mentor Profile   |

---

## Student Routes

| Route              | Description       |
| ------------------ | ----------------- |
| /student/dashboard | Student Dashboard |
| /student/sessions  | Session History   |
| /profile           | User Profile      |

---

## Mentor Routes

| Route                | Description             |
| -------------------- | ----------------------- |
| /mentor/dashboard    | Mentor Dashboard        |
| /mentor/availability | Availability Management |
| /mentor/sessions     | Session Management      |

---

## Admin Routes

| Route           | Description        |
| --------------- | ------------------ |
| /admin          | Admin Dashboard    |
| /admin/users    | User Management    |
| /admin/stacks   | Stack Management   |
| /admin/sessions | Session Monitoring |

---

## Error Route

| Route | Description   |
| ----- | ------------- |
| *     | 404 Not Found |

---

# 9. Project Folder Structure

## Frontend Structure

src/

├── app/

├── routes/

├── layouts/

├── pages/

│   ├── auth/

│   ├── student/

│   ├── mentor/

│   ├── admin/

│   └── shared/

│

├── components/

│   ├── common/

│   ├── forms/

│   ├── cards/

│   ├── tables/

│   ├── feedback/

│   └── layouts/

│

├── hooks/

├── services/

├── store/

├── types/

├── utils/

├── locales/

└── assets/

---

## Backend Structure

src/

├── auth/

├── users/

├── students/

├── mentors/

├── sessions/

├── availability/

├── stacks/

├── admin/

├── audit/

│

├── common/

│   ├── guards/

│   ├── decorators/

│   ├── filters/

│   ├── interceptors/

│   └── constants/

│

├── prisma/

└── main.ts

---

# 10. Development Workflow

## Step 1

Create GitHub Repository

---

## Step 2

Initialize React Project

---

## Step 3

Initialize NestJS Project

---

## Step 4

Configure MySQL

---

## Step 5

Configure Prisma

---

## Step 6

Create Authentication Module

---

## Step 7

Develop Features in Parallel

Student Module

Mentor Module

Admin Module

UI Infrastructure

---

## Step 8

Integration Phase

Frontend + Backend

---

## Step 9

Testing

---

## Step 10

Deployment

---

# 11. Git Strategy

## Main Branches

main

develop

---

## Feature Branches

feature/auth

feature/student

feature/mentor

feature/admin

feature/ui

---

## Rules

* No direct commits to main.
* Create Pull Requests.
* PR must be reviewed.
* Resolve conflicts before merge.

---

# 12. Coding Standards

## React

* Functional Components only
* Custom Hooks for reusable logic
* No business logic inside UI components
* Use TypeScript everywhere

---

## NestJS

* Controller → Service → Prisma flow
* DTO validation required
* No direct database calls in controllers
* Use dependency injection

---

## Naming Conventions

Components:

PascalCase

Example:

MentorCard.tsx

---

Hooks:

useCamelCase

Example:

useMentors.ts

---

API Services:

camelCase

Example:

mentorService.ts

---

# 13. Team Ownership Matrix

## Amir Alsayed

Backend Lead

Ownership:

* Authentication
* Authorization
* User Module
* Prisma Setup
* MySQL Setup
* Global Error Handling
* Swagger

Deliverables:

* Auth APIs
* User APIs
* JWT Guards
* Role Guards

---

## Amir Maula

Student Module

Ownership:

Frontend:

* Mentor Search
* Mentor Details
* Booking UI
* Student Dashboard

Backend:

* Student Profile APIs
* Session Booking APIs

Deliverables:

* Search
* Pagination
* Filters
* Booking

---

## Mohamed Elazazzy

Mentor Module

Ownership:

Frontend:

* Mentor Dashboard
* Availability UI

Backend:

* Mentor Profile APIs
* Availability APIs
* Evaluation APIs

Deliverables:

* Mentor Management
* Availability Management

---

## Hager Noral

Admin Module

Ownership:

Frontend:

* Admin Dashboard
* User Tables
* Stack Management

Backend:

* User Moderation APIs
* Stack CRUD APIs

Deliverables:

* Admin Management System

---

## Donia Mohamed

UI Infrastructure

Ownership:

* Shared Components
* Layout System
* Dark Mode
* RTL Support
* i18n
* Toast Notifications
* Skeleton Loaders
* Reusable Modals

Deliverables:

* UI Foundation
* Theme System
* Translation System

---

# 14. Sprint Plan

## Day 1

* Repository Setup
* React Setup
* NestJS Setup
* Prisma Setup
* MySQL Setup

---

## Day 2

* Authentication
* User Roles
* Protected Routes

---

## Day 3

* Student Module Development

---

## Day 4

* Mentor Module Development

---

## Day 5

* Admin Module Development

---

## Day 6

* UI Polish
* Dark Mode
* RTL
* Testing

---

## Day 7

* Bug Fixes
* Integration
* Deployment
* Documentation
* Video Recording

---

# 15. Definition of Done

A feature is complete only when:

✅ UI Implemented

✅ API Connected

✅ Validation Added

✅ Error Handling Added

✅ Loading State Added

✅ Empty State Added

✅ Toast Notifications Added

✅ Responsive Design Verified

✅ Pull Request Approved

✅ No Console Errors

✅ No TypeScript Errors

✅ Manual Testing Completed

---

# Success Criteria

The project is considered complete when:

* All required routes exist
* Authentication works correctly
* Role-based access is enforced
* Session booking works
* Mentor availability works
* Admin CRUD works
* Dark mode works
* Arabic translation works
* Application is deployed
* Git history demonstrates active team collaboration
* Final walkthrough video is recorded and submitted
