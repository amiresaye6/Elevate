import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { ReviewSession, UpdateSessionStatusPayload } from '../../types/mentor.types'
import { getMentorSessions, updateSessionStatus } from '../../services/mentorService'

interface SessionState {
  sessions: ReviewSession[]
  loading: boolean
  error: string | null
}

const initialState: SessionState = {
  sessions: [],
  loading: false,
  error: null,
}

export const fetchMentorSessions = createAsyncThunk(
  'session/fetchMentorSessions',
  async (mentorId: number, { rejectWithValue }) => {
    try {
      return await getMentorSessions(mentorId)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch sessions'
      )
    }
  }
)

export const updateSession = createAsyncThunk(
  'session/updateStatus',
  async (
    {
      sessionId,
      payload,
    }: { sessionId: number; payload: UpdateSessionStatusPayload },
    { rejectWithValue }
  ) => {
    try {
      return await updateSessionStatus(sessionId, payload)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update session'
      )
    }
  }
)

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearSessionError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMentorSessions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMentorSessions.fulfilled, (state, action) => {
        state.loading = false
        state.sessions = (action.payload || []) as ReviewSession[]
      })
      .addCase(fetchMentorSessions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateSession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.loading = false
        const index = state.sessions.findIndex(
          (s) => s.id === action.payload.id
        )
        if (index !== -1) {
          state.sessions[index] = action.payload
        }
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearSessionError } = sessionSlice.actions
export default sessionSlice.reducer