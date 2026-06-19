import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string | number
  name: string
  email: string
  mentorProfileId?: number
  studentProfileId?: number
}

interface AuthState {
  accessToken: string | null
  user: User | null
  role: 'student' | 'mentor' | 'admin' | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  role: localStorage.getItem('role') as any,
  isAuthenticated: !!localStorage.getItem('accessToken'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user: User; role: 'student' | 'mentor' | 'admin' }>
    ) => {
      const { accessToken, user, role } = action.payload
      state.accessToken = accessToken
      state.user = user
      state.role = role
      state.isAuthenticated = true

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('role', role)
    },
     setProfileId: (
      state,
      action: PayloadAction<{
        mentorProfileId?: number
        studentProfileId?: number
      }>
    ) => {
      if (state.user) {
        if (action.payload.mentorProfileId) {
          state.user.mentorProfileId = action.payload.mentorProfileId
        }
        if (action.payload.studentProfileId) {
          state.user.studentProfileId = action.payload.studentProfileId
        }
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    clearCredentials: (state) => {
      state.accessToken = null
      state.user = null
      state.role = null
      state.isAuthenticated = false

      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
