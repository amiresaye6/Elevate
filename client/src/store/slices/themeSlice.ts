import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface ThemeState {
  theme: 'light' | 'dark'
}

const getInitialTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (savedTheme) return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialState: ThemeState = {
  theme: getInitialTheme(),
}

// Initial side-effect to apply the theme to the document root element on bootstrap
if (initialState.theme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light'
      state.theme = nextTheme
      localStorage.setItem('theme', nextTheme)
      
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
      
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
