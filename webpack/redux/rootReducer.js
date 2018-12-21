import {combineReducers} from 'redux'

import {reducer as form} from 'redux-form'

import {reducer as configuration} from 'reducers/configuration'
import {reducer as settings} from 'reducers/settings'
import {reducer as sw} from 'reducers/sw'

export default combineReducers({
  form,
  configuration,
  settings,
  sw
})
