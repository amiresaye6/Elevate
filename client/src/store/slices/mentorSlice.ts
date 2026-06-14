import { createSlice } from '@reduxjs/toolkit'

interface MentorState {
  mentors: any[]
  loading: boolean
  error: string | null
}

const initialState: MentorState = {
  mentors: [],
  loading: false,
  error: null,
}

const mentorSlice = createSlice({
  name: 'mentor',
  initialState,
  reducers: {
    // Reducers to be implemented by team members
  },
})

export default mentorSlice.reducer
