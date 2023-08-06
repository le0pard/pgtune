import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { listenerMiddleware } from '@app/listenerMiddleware'
import { submitConfiguration } from '@app/actions/configurator'
import { LocalStorage } from '@common/utils/localStorage'

import { APP_THEMES_LIGHT, APP_THEMES_DARK, TAB_CONFIG } from './constants'

const initialState = {
  tabState: TAB_CONFIG,
  theme: APP_THEMES_LIGHT
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    openConfigTab: (state, action) => {
      state.tabState = action.payload
    },
    toggleTheme: (state) => {
      state.theme = APP_THEMES_LIGHT === state.theme ? APP_THEMES_DARK : APP_THEMES_LIGHT
    }
  },
  extraReducers: (builder) => {
    builder.addCase(submitConfiguration, (state) => {
      state.tabState = TAB_CONFIG
    })
  }
})

export const { openConfigTab, toggleTheme } = settingsSlice.actions

export const selectSettings = (state) => state.settings
export const selectThemeSettings = (state) => selectSettings(state).theme
export const selectTabSettings = (state) => selectSettings(state).tabState

// Export the slice reducer as the default export
export default settingsSlice.reducer

// listeners
listenerMiddleware.startListening({
  matcher: isAnyOf(toggleTheme),
  effect: (_action, listenerApi) => {
    LocalStorage.setItem('theme', selectThemeSettings(listenerApi.getState()))
  }
})
