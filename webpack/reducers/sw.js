import {combineReducers} from 'redux'
import {createAction, createReducer} from 'redux-act'

export const readyToUpdated = createAction('Ready to update SW')
export const updating = createAction('Updating SW cache')

const isNewVersionAvailable = createReducer({
  [readyToUpdated]: () => true,
  [updating]: () => false
}, false)

export const reducer = combineReducers({
  isNewVersionAvailable
})
