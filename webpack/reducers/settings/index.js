import {combineReducers} from 'redux'
import {createAction, createReducer} from 'redux-act'
import {submitConfiguration} from 'reducers/configuration'
import {
  APP_THEMES_LIGHT,
  APP_THEMES_DARK,
  TAB_CONFIG
} from './constants'

export const settingsToggleTheme = createAction('Toggle app theme')
export const openConfigTab = createAction('Open config tab')

const theme = createReducer({
  [settingsToggleTheme]: (state) => (
    APP_THEMES_LIGHT === state ? APP_THEMES_DARK : APP_THEMES_LIGHT
  )
}, APP_THEMES_LIGHT)

const tabState = createReducer({
  [openConfigTab]: (_state, payload) => payload,
  [submitConfiguration]: () => TAB_CONFIG
}, TAB_CONFIG)

export const reducer = combineReducers({
  tabState,
  theme
})
