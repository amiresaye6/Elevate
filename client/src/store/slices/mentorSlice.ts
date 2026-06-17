import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { MentorAvailability, MentorDashboardData } from '../../types/mentor.types'
import { getAvailability, getMentorDashboard } from '../../services/mentorService'

interface MentorState {
  availability: MentorAvailability[]
  dashboard: MentorDashboardData | null
  loading: boolean
  error: string | null
}

const initialState: MentorState = {
  availability: [],
  dashboard: null,
  loading: false,
  error: null,
}

export const fetchAvailability = createAsyncThunk(
  'mentor/fetchAvailability',
  async (mentorId: number, { rejectWithValue }) => {
    try {
      return await getAvailability(mentorId)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch availability'
      )
    }
  }
)

export const fetchMentorDashboard = createAsyncThunk(
  'mentor/fetchDashboard',
  async (mentorId: number, { rejectWithValue }) => {
    try {
      return await getMentorDashboard(mentorId)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard'
      )
    }
  }
)

const mentorSlice = createSlice({
  name: 'mentor',
  initialState,
  reducers: {
    clearMentorError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailability.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.loading = false
        state.availability = action.payload
      })
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchMentorDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMentorDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.dashboard = action.payload
      })
      .addCase(fetchMentorDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearMentorError } = mentorSlice.actions
export default mentorSlice.reducer