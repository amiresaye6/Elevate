# Academic Mentorship Platform

# Frontend Specification

## React + TypeScript + Tailwind

---

# Table of Contents

1. Frontend Architecture
2. Global UI Requirements
3. Routing Structure
4. Authentication Flow
5. State Management
6. Shared Components
7. Pages Specification
8. Internationalization
9. Theme Management
10. Error Handling
11. Acceptance Criteria

---

# 1. Frontend Architecture

## Core Principles

The frontend must:

* Be fully responsive
* Support Dark Mode
* Support Arabic and English
* Use reusable components
* Use centralized API services
* Use role-based routing
* Use TypeScript everywhere

---

# 2. Global UI Requirements

Every page must provide:

### Loading State

Use Skeleton components.

Examples:

* Mentor cards skeleton
* Table skeleton
* Dashboard skeleton

---

### Empty State

Example:

"No mentors found."

"No sessions available."

---

### Error State

Example:

"Something went wrong."

Retry button must exist.

---

### Toast Notifications

Success

```text
Session booked successfully.
```

Error

```text
Failed to create session.
```

---

# 3. Routing Structure

## Public Routes

```text
/
/login
/register
/mentors
/mentor/:id
```

---

## Student Routes

```text
/student/dashboard
/student/sessions
/profile
```

---

## Mentor Routes

```text
/mentor/dashboard
/mentor/availability
/mentor/sessions
/profile
```

---

## Admin Routes

```text
/admin
/admin/users
/admin/stacks
/admin/sessions
```

---

## Fallback

```text
*
```

404 Page

---

# 4. Authentication Flow

## Register

User selects:

* Student
* Mentor

Request sent

POST /api/auth/register

Success:

* Redirect Login

---

## Login

Request

POST /api/auth/login

Success

Store:

```ts
accessToken
user
role
```

Redirect according to role.

Student

```text
/student/dashboard
```

Mentor

```text
/mentor/dashboard
```

Admin

```text
/admin
```

---

# 5. State Management

Redux Toolkit

Store Slices

```text
authSlice
mentorSlice
sessionSlice
adminSlice
themeSlice
languageSlice
```

---

# 6. Shared Components

## Navbar

Features

* Logo
* Language Switch
* Theme Toggle
* User Menu

---

## Footer

Features

* Copyright
* Navigation Links

---

## Button

Variants

```text
Primary
Secondary
Danger
Outline
```

---

## Modal

Reusable

Used For

* Booking
* Confirm Delete
* Confirmation Actions

---

## Pagination

Reusable

Props

```ts
currentPage
totalPages
onPageChange
```

---

## Loading Skeleton

Reusable

Used everywhere.

---

## Search Input

Reusable

Includes:

Debounce 500ms

---

# 7. Pages Specification

---

# PAGE 1

# Landing Page

Route

```text
/
```

Purpose

Marketing page.

Sections

* Hero
* Featured Mentors
* Features
* Footer

Components

```text
Navbar
HeroSection
MentorPreview
FeatureCards
Footer
```

APIs

GET /api/mentors

Acceptance Criteria

* Responsive
* Dark mode supported

---

# PAGE 2

# Login Page

Route

```text
/login
```

Fields

* Email
* Password

Validation

Email required.

Password required.

Components

```text
LoginForm
```

API

POST /api/auth/login

Success

Redirect by role.

---

# PAGE 3

# Register Page

Route

```text
/register
```

Fields

Common

* Name
* Email
* Password
* Confirm Password

Role

* Student
* Mentor

Mentor Extra

* Title
* Bio
* Stack

Validation

* Email unique
* Password min 8 chars

API

POST /api/auth/register

---

# PAGE 4

# Mentor Discovery

Route

```text
/mentors
```

Purpose

Browse mentors.

Filters

* Stack
* Rating
* Availability

Search

Keyword

Debounced

500ms

Sort

* Rating
* Price
* Availability

Pagination

Required

API

GET /api/mentors

Acceptance Criteria

* Search works
* Pagination works
* Filters work

---

# PAGE 5

# Mentor Profile

Route

```text
/mentor/:id
```

Purpose

Display mentor details.

Sections

* Profile
* Bio
* Skills
* Availability

Components

```text
MentorHeader
AvailabilityTable
BookingButton
```

API

GET /api/mentors/:id

GET /api/mentors/:id/availability

---

# PAGE 6

# Booking Modal

Purpose

Create review session.

Fields

* Date
* Time Slot
* Description

Validation

Description required.

Minimum

20 chars

API

POST /api/sessions/book

Success

Close modal.

Show toast.

---

# PAGE 7

# Student Dashboard

Route

```text
/student/dashboard
```

Sections

Upcoming Sessions

Completed Sessions

Canceled Sessions

Profile Summary

API

GET /api/sessions

---

# PAGE 8

# Student Session Details

Route

```text
/student/sessions
```

Features

* View details
* Cancel booking
* View evaluation

API

GET /api/sessions

PUT /api/sessions/:id/status

---

# PAGE 9

# Mentor Dashboard

Route

```text
/mentor/dashboard
```

Sections

* Upcoming Sessions
* Completed Sessions
* Statistics

API

GET /api/mentor/sessions

---

# PAGE 10

# Availability Management

Route

```text
/mentor/availability
```

Features

Create Availability

Edit Availability

Delete Availability

Fields

* Day
* Start Time
* End Time

APIs

GET

POST

PUT

DELETE

availability endpoints

---

# PAGE 11

# Session Evaluation

Route

```text
/mentor/sessions
```

Purpose

Add evaluation notes.

Fields

```text
Evaluation Notes
Status
```

API

PUT /api/sessions/:id/status

---

# PAGE 12

# Admin Dashboard

Route

```text
/admin
```

Sections

Statistics

Recent Activity

Quick Actions

API

GET /api/admin/dashboard

---

# PAGE 13

# User Management

Route

```text
/admin/users
```

Features

* Search
* Pagination
* Approve Mentor
* Block User

APIs

GET /api/admin/users

PUT /api/admin/users/:id/status

---

# PAGE 14

# Stack Management

Route

```text
/admin/stacks
```

Features

Create

Edit

Delete

Stacks

API

GET

POST

PUT

DELETE

/api/stacks

---

# PAGE 15

# Session Monitoring

Route

```text
/admin/sessions
```

Purpose

Monitor all sessions.

Features

* Search
* Filters
* Pagination

API

GET /api/admin/sessions

---

# PAGE 16

# Profile Page

Route

```text
/profile
```

Purpose

Update personal information.

Fields

Name

Email

Bio

Title

Stack

API

GET /api/auth/profile

PUT /api/auth/profile

---

# PAGE 17

# Not Found

Route

```text
*
```

Components

404 Illustration

Back Home Button

---

# 8. Internationalization

Languages

English

Arabic

Requirements

* Dynamic switching
* RTL support
* Persist selection

---

# 9. Theme Management

Themes

Light

Dark

Requirements

* Persist in localStorage
* Instant switching

---

# 10. Error Handling

Network Error

401 Unauthorized

403 Forbidden

404 Not Found

500 Server Error

Must show user-friendly messages.

---

# 11. Frontend Definition of Done

A page is complete when:

✅ Responsive

✅ API Connected

✅ Validation Added

✅ Loading State Added

✅ Empty State Added

✅ Error State Added

✅ Toast Notifications Added

✅ Dark Mode Supported

✅ Arabic Supported

✅ TypeScript Clean

✅ No Console Errors

✅ Tested Manually
