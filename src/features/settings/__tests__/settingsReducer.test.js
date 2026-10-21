import { settingsReducer, initialState } from '../settingsReducer'
import { APP_THEMES_DARK, APP_THEMES_LIGHT, TAB_ALTER_SYSTEM } from '../constants'

describe('settingsReducer', () => {
  it('opens configuration tab', () => {
    expect(
      settingsReducer(initialState, { type: 'openConfigTab', payload: TAB_ALTER_SYSTEM }).tabState
    ).toEqual(TAB_ALTER_SYSTEM)
  })

  it('toggles theme', () => {
    const darkState = settingsReducer(initialState, { type: 'toggleTheme' })
    expect(darkState.theme).toEqual(APP_THEMES_DARK)
    expect(settingsReducer(darkState, { type: 'toggleTheme' }).theme).toEqual(APP_THEMES_LIGHT)
  })

  it('toggles include warnings', () => {
    expect(
      settingsReducer(initialState, { type: 'toggleIncludeWarnings' }).includeWarnings
    ).toEqual(false)
  })

  it('keeps state for unknown action', () => {
    expect(settingsReducer(initialState, { type: 'unknown' })).toBe(initialState)
  })
})
