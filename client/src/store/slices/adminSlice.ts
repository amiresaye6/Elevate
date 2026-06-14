import { createSlice } from '@reduxjs/toolkit'

interface AdminState {
  users: any[]
  loading: boolean
  error: string | null
}

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Reducers to be implemented by team members
  },
})

export default adminSlice.reducer
