import {combineReducers} from 'redux'
import {createAction, createReducer} from 'redux-act'

export const settingsToggleTheme = createAction('Toggle app theme')

const theme = createReducer({
  [settingsToggleTheme]: (state) => false
}, true)

export const reducer = combineReducers({
  theme
})
