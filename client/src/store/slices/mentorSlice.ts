// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// import type { MentorAvailability, MentorDashboardData } from '../../types/mentor.types'
// import { getAvailability, getMentorDashboard } from '../../services/mentorService'

// interface MentorState {
//   availability: MentorAvailability[]
//   dashboard: MentorDashboardData | null
//   loading: boolean
//   error: string | null
// }

// const initialState: MentorState = {
//   availability: [],
//   dashboard: null,
//   loading: false,
//   error: null,
// }

// export const fetchAvailability = createAsyncThunk(
//   'mentor/fetchAvailability',
//   async (mentorId: number, { rejectWithValue }) => {
//     try {
//       return await getAvailability(mentorId)
//     } catch (error: any) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch availability'
//       )
//     }
//   }
// )

// export const fetchMentorDashboard = createAsyncThunk(
//   'mentor/fetchDashboard',
//   async (mentorId: number, { rejectWithValue }) => {
//     try {
//       return await getMentorDashboard(mentorId)
//     } catch (error: any) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch dashboard'
//       )
//     }
//   }
// )

// const mentorSlice = createSlice({
//   name: 'mentor',
//   initialState,
//   reducers: {
//     clearMentorError: (state) => {
//       state.error = null
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAvailability.pending, (state) => {
//         state.loading = true
//         state.error = null
//       })
//       .addCase(fetchAvailability.fulfilled, (state, action) => {
//         state.loading = false
//         state.availability = action.payload
//       })
//       .addCase(fetchAvailability.rejected, (state, action) => {
//         state.loading = false
//         state.error = action.payload as string
//       })
//       .addCase(fetchMentorDashboard.pending, (state) => {
//         state.loading = true
//         state.error = null
//       })
//       .addCase(fetchMentorDashboard.fulfilled, (state, action) => {
//         state.loading = false
//         state.dashboard = action.payload
//       })
//       .addCase(fetchMentorDashboard.rejected, (state, action) => {
//         state.loading = false
//         state.error = action.payload as string
//       })
//   },
// })

// export const { clearMentorError } = mentorSlice.actions
// export default mentorSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { MentorAvailability, MentorDashboardData, CreateAvailabilityPayload } from '../../types/mentor.types'
import { 
  getAvailability, 
  getMentorDashboard, 
  createAvailability, 
  updateAvailability, 
  deleteAvailability 
} from '../../services/mentorService'

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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch availability')
    }
  }
)

// 🆕 أكشن الإضافة
export const addAvailabilitySlot = createAsyncThunk(
  'mentor/addAvailability',
  async (payload: CreateAvailabilityPayload, { rejectWithValue }) => {
    try {
      return await createAvailability(payload)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Forbidden: Check your permissions')
    }
  }
)

// 🆕 أكشن التعديل (أضفنا الـ mentorId لحل مشكلة الصلاحيات)
export const editAvailabilitySlot = createAsyncThunk(
  'mentor/editAvailability',
  async ({ id, payload }: { id: number; payload: Partial<CreateAvailabilityPayload> }, { rejectWithValue }) => {
    try {
      return await updateAvailability(id, payload)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Forbidden: Cannot update this slot')
    }
  }
)

// 🆕 أكشن الحذف
export const removeAvailabilitySlot = createAsyncThunk(
  'mentor/removeAvailability',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteAvailability(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Forbidden: Cannot delete this slot')
    }
  }
)

export const fetchMentorDashboard = createAsyncThunk(
  'mentor/fetchDashboard',
  async (mentorId: number, { rejectWithValue }) => {
    try {
      return await getMentorDashboard(mentorId)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard')
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
      // Fetch
      .addCase(fetchAvailability.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.loading = false
        state.availability = Array.isArray(action.payload) ? action.payload : (action.payload as any)?.data || []
      })
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Add Slot
      .addCase(addAvailabilitySlot.fulfilled, (state, action) => {
        // إضافة السلوت الجديد بأمان للـ state
        if (action.payload) {
          state.availability.push(action.payload)
        }
      })
      // Remove Slot
      .addCase(removeAvailabilitySlot.fulfilled, (state, action) => {
        state.availability = state.availability.filter(slot => slot.id !== action.payload)
      })
      // Dashboard
      .addCase(fetchMentorDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.dashboard = action.payload
      })
  },
})

export const { clearMentorError } = mentorSlice.actions
export default mentorSlice.reducer