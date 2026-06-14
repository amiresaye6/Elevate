import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import i18n from '../../locales/i18n'

interface LanguageState {
  language: string
}

const initialState: LanguageState = {
  language: localStorage.getItem('i18nextLng') || 'en',
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    changeLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
      i18n.changeLanguage(action.payload)
    },
  },
})

export const { changeLanguage } = languageSlice.actions
export default languageSlice.reducer
