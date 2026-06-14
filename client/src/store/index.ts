import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'

// Import reducers
import authReducer from './slices/authSlice'
import mentorReducer from './slices/mentorSlice'
import sessionReducer from './slices/sessionSlice'
import adminReducer from './slices/adminSlice'
import themeReducer from './slices/themeSlice'
import languageReducer from './slices/languageSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    mentor: mentorReducer,
    session: sessionReducer,
    admin: adminReducer,
    theme: themeReducer,
    language: languageReducer,
  },
})

// Types for TypeScript support
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed custom Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
