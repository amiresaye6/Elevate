import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
  email: string
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
