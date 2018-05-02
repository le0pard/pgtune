import {combineReducers} from 'redux'
import {createAction, createReducer} from 'redux-act'

export const updating = createAction('Updating SW cache')
export const updated = createAction('Updated SW cache')
export const failed = createAction('Failed update SW cache')

const isUpdating = createReducer({
  [updating]: () => true,
  [updated]: () => false,
  [failed]: () => false
}, false)

const isFailed = createReducer({
  [updating]: () => false,
  [updated]: () => false,
  [failed]: () => true
}, false)

const isNewVersionAvailable = createReducer({
  [updating]: () => false,
  [updated]: () => true,
  [failed]: () => false
}, false)

export const reducer = combineReducers({
  isUpdating,
  isFailed,
  isNewVersionAvailable
})
