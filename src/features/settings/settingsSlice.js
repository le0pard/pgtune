import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { listenerMiddleware } from '@app/listenerMiddleware'
import { LocalStorage } from '@common/utils/localStorage'

import { APP_THEMES_LIGHT, APP_THEMES_DARK, TAB_CONFIG } from './constants'

// exported to fill preloaded state, which replaces initial state of the slice
export const initialState = {
  tabState: TAB_CONFIG,
  theme: APP_THEMES_LIGHT,
  includeWarnings: true
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
    },
    toggleIncludeWarnings: (state) => {
      state.includeWarnings = state.includeWarnings === false
    }
  }
})

export const { openConfigTab, toggleTheme, toggleIncludeWarnings } = settingsSlice.actions

export const selectSettings = (state) => state.settings
export const selectThemeSettings = (state) => selectSettings(state).theme
export const selectTabSettings = (state) => selectSettings(state).tabState
// include warnings as comments in copied configuration (enabled by default)
export const selectIncludeWarningsSettings = (state) =>
  selectSettings(state).includeWarnings !== false

// Export the slice reducer as the default export
export default settingsSlice.reducer

// listeners
listenerMiddleware.startListening({
  matcher: isAnyOf(toggleTheme),
  effect: (_action, listenerApi) => {
    LocalStorage.setItem('theme', selectThemeSettings(listenerApi.getState()))
  }
})

listenerMiddleware.startListening({
  matcher: isAnyOf(toggleIncludeWarnings),
  effect: (_action, listenerApi) => {
    LocalStorage.setItem('includeWarnings', selectIncludeWarningsSettings(listenerApi.getState()))
  }
})
