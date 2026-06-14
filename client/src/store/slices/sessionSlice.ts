import { createSlice } from '@reduxjs/toolkit'

interface SessionState {
  sessions: any[]
  loading: boolean
  error: string | null
}

const initialState: SessionState = {
  sessions: [],
  loading: false,
  error: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Reducers to be implemented by team members
  },
})

export default sessionSlice.reducer
