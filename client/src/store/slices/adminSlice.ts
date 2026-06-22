import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api' 

interface User {
  id: number;
  email: string;
  role: string;
  isBlocked: boolean;
}

interface Session {
  id: number;
  mentorId: number;
  studentId: number;
  startTime: string;
  endTime: string;
  description: string;
  status: string;
  evaluationNotes?: string;
}

interface AdminState {
  users: User[];
  sessions: Session[];
  usersPagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  sessionsPagination: {
     page: number;
     limit: number; 
     totalItems: number; 
     totalPages: number
  };
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  sessions: [],
  usersPagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1
  },
  sessionsPagination: {
    page: 1, 
    limit: 10, 
    totalItems: 0, 
    totalPages: 1 
  },
  loading: false,
  error: null
};

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (page: number, { rejectWithValue }) => {
    try {
      const response = await api.get<any>(`/users?page=${page}`);
      if (response && response.data && (response.data.success === "true" || response.data.success === true)) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch users');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server Error');
    }
  }
);

export const fetchAdminSessions = createAsyncThunk(
  'admin/fetchSessions',
  async (page: number, { rejectWithValue }) => {
    try {
      const response = await api.get<any>(`admin/sessions?page=${page}`);
      if (response && response.data && response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch sessions');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server Error');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.users = [];
      state.sessions = [];
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.usersPagination = action.payload.pagination; 
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.sessions; // المصفوفة
        state.sessionsPagination = action.payload.pagination; // تحديث الصفحات ديناميكياً
      })
      .addCase(fetchAdminSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
})

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;