import { createContext, useContext } from 'react'

/**
 * @typedef {typeof import('./settingsReducer').initialState & {
 *   openConfigTab: (tab: string) => void,
 *   toggleTheme: () => void,
 *   toggleIncludeWarnings: () => void
 * }} Settings
 */

/** @type {import('react').Context<Settings | null>} */
export const SettingsContext = createContext(null)

/**
 * User settings with actions to change them (see SettingsProvider)
 * @returns {Settings}
 */
export const useSettings = () => useContext(SettingsContext)
