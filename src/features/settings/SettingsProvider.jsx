import { useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import { LocalStorage } from '@common/utils/localStorage'
import { withLogger } from '@common/utils/reducerLogger'
import { APP_THEMES_LIGHT, APP_THEMES_DARK } from './constants'
import { SettingsContext } from './settingsContext'
import { initialState, settingsReducer } from './settingsReducer'

const reducer = withLogger('settings', settingsReducer)

// saved (or system) theme and saved preferences. Prerender has no window, so it uses defaults
const loadSettings = () => {
  if (typeof window === 'undefined') {
    return initialState
  }

  let theme = LocalStorage.getItem('theme')
  if (!theme && window.matchMedia('(prefers-color-scheme: dark)')?.matches) {
    theme = APP_THEMES_DARK
  }

  return {
    ...initialState,
    theme: theme || APP_THEMES_LIGHT,
    includeWarnings: LocalStorage.getItem('includeWarnings') !== false
  }
}

// saves value, when it is changed. Initial value is not saved,
// so theme follows system preference until user switches it.
// Layout effect saves right after the change (effect waits for paint),
// so it is not lost, if the page is reloaded or closed immediately
const useSaveOnChange = (key, value) => {
  const savedValue = useRef(value)

  useLayoutEffect(() => {
    if (!Object.is(savedValue.current, value)) {
      savedValue.current = value
      LocalStorage.setItem(key, value)
    }
  }, [key, value])
}

/**
 * Provides user settings (theme, selected tab, include warnings) with actions to change them
 * @param {{ children: import('react').ReactNode }} props
 */
const SettingsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadSettings)

  useSaveOnChange('theme', state.theme)
  useSaveOnChange('includeWarnings', state.includeWarnings)

  // dispatch does not change, so actions keep identity between renders
  const actions = useMemo(
    () => ({
      openConfigTab: (tab) => dispatch({ type: 'openConfigTab', payload: tab }),
      toggleTheme: () => dispatch({ type: 'toggleTheme' }),
      toggleIncludeWarnings: () => dispatch({ type: 'toggleIncludeWarnings' })
    }),
    []
  )
  const value = useMemo(() => ({ ...state, ...actions }), [state, actions])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export default SettingsProvider
