import api from './api'
import type { 
  ReviewSession, 
  UpdateSessionStatusPayload, 
  MentorAvailability, 
  MentorDashboardData,
  CreateAvailabilityPayload,
  MentorProfile
} from '../types/mentor.types'

export const getMentorSessions = async (mentorId: number): Promise<ReviewSession[]> => {
  const response = await api.get('/sessions', {
    params: { role: 'mentor', profileId: mentorId }
  })
  return response.data.data
}

export const updateSessionStatus = async (
  sessionId: number,
  payload: UpdateSessionStatusPayload
): Promise<ReviewSession> => {
  const response = await api.put(`/sessions/${sessionId}/status`, payload)
  return response.data.data
}

export const getAvailability = async (mentorId: number): Promise<MentorAvailability[]> => {
  const response = await api.get('/availability', {
    params: { mentorId }
  })
  return response.data
}

export const getMentorDashboard = async (mentorId: number): Promise<MentorDashboardData> => {
  const response = await api.get(`/mentors/${mentorId}/dashboard`)
  return response.data
}

export const createAvailability = async (
  payload: CreateAvailabilityPayload
): Promise<MentorAvailability> => {
  const response = await api.post('/availability', payload)
  return response.data
}

export const updateAvailability = async (
  id: number,
  payload: Partial<CreateAvailabilityPayload>
): Promise<MentorAvailability> => {
  const response = await api.put(`/availability/${id}`, payload)
  return response.data
}

export const deleteAvailability = async (id: number): Promise<void> => {
  await api.delete(`/availability/${id}`)
}

export const getMentors = async (params?: { search?: string; stackId?: number }) => {
  const response = await api.get('/mentors', { params })
  return response.data
}

export const getMentorById = async (id: number | string): Promise<MentorProfile> => {
  const response = await api.get(`/mentors/${id}`)
  return response.data
}

export const getStacks = async () => {
  const response = await api.get('/stacks')
  return response.data
}