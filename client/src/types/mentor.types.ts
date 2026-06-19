export interface MentorAvailability {
  id: number
  mentorId: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface CreateAvailabilityPayload {
  mentorId: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface UpdateAvailabilityPayload {
  dayOfWeek?: string
  startTime?: string
  endTime?: string
}

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED'

export interface ReviewSession {
  id: number
  mentorId: number
  studentId: number
  startTime: string
  endTime: string
  description: string
  status: SessionStatus
  evaluationNotes?: string
  student?: {
    name: string
  }
}

export interface UpdateSessionStatusPayload {
  status: SessionStatus
  evaluationNotes?: string
}

export interface MentorProfile {
  id: number
  name: string
  title: string
  bio: string
  averageRating: number
  hourlyRate: number
  isVerified: boolean
  stack: {
    id: number
    name: string
    description: string
  }
}

export interface MentorDashboardStats {
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  availabilitySlots: number
}

export interface MentorDashboardData {
  profile: MentorProfile
  stats: MentorDashboardStats
  recentSessions: ReviewSession[]
  availability: MentorAvailability[]
}