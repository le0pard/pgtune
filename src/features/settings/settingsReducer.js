import { APP_THEMES_LIGHT, APP_THEMES_DARK, TAB_CONFIG } from './constants'

export const initialState = {
  tabState: TAB_CONFIG,
  theme: APP_THEMES_LIGHT,
  // include warnings as comments in copied configuration
  includeWarnings: true
}

export const settingsReducer = (state, action) => {
  switch (action.type) {
    case 'openConfigTab':
      return { ...state, tabState: action.payload }
    case 'toggleTheme':
      return {
        ...state,
        theme: state.theme === APP_THEMES_LIGHT ? APP_THEMES_DARK : APP_THEMES_LIGHT
      }
    case 'toggleIncludeWarnings':
      return { ...state, includeWarnings: !state.includeWarnings }
    default:
      return state
  }
}
