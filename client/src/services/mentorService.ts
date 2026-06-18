import api from './api'
import type {
  MentorAvailability,
  CreateAvailabilityPayload,
  UpdateAvailabilityPayload,
  ReviewSession,
  UpdateSessionStatusPayload,
  MentorDashboardData,
} from '../types/mentor.types'


export const getAvailability = async (
  mentorId: number
): Promise<MentorAvailability[]> => {
  const response = await api.get(`/availability?mentorId=${mentorId}`)
  return response.data
}

export const createAvailability = async (
  payload: CreateAvailabilityPayload
): Promise<MentorAvailability> => {
  const response = await api.post('/availability', payload)
  return response.data
}

// export const updateAvailability = async (
//   id: number,
//   payload: UpdateAvailabilityPayload
// ): Promise<MentorAvailability> => {
//   const response = await api.put(`/availability/${id}`, payload)
//   return response.data
// }

// export const deleteAvailability = async (id: number): Promise<void> => {
//   await api.delete(`/availability/${id}`)
// }
export const updateAvailability = async (
  id: number,
  payload: UpdateAvailabilityPayload
): Promise<MentorAvailability> => {
  const token = localStorage.getItem('accessToken') 
  
  const response = await api.put(`/availability/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}

export const deleteAvailability = async (id: number): Promise<void> => {
  const token = localStorage.getItem('accessToken') 
  
  await api.delete(`/availability/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

// ─── Sessions APIs ─────────────────────────────────────────────────

export const getMentorSessions = async (
  mentorId: number
): Promise<ReviewSession[]> => {
  const response = await api.get(`/sessions?mentorId=${mentorId}`)
  return response.data
}

export const updateSessionStatus = async (
  sessionId: number,
  payload: UpdateSessionStatusPayload
): Promise<ReviewSession> => {
  const response = await api.put(`/sessions/${sessionId}/status`, payload)
  return response.data
}

export const getMentorDashboard = async (
  mentorId: number
): Promise<MentorDashboardData> => {
  const response = await api.get(`/mentors/${mentorId}/dashboard`)
  return response.data
}

