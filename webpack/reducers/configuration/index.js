import {combineReducers} from 'redux'
import {createAction, createReducer} from 'redux-act'
import {
  DEFAULT_DB_VERSION,
  OS_LINUX,
  DB_TYPE_WEB,
  SIZE_UNIT_GB,
  HARD_DRIVE_HDD
} from 'reducers/configuration/constants'

export const submitConfiguration = createAction('Submit hardware configuration')

const dbVersion = createReducer({
  [submitConfiguration]: (state, {dbVersion}) => parseFloat(dbVersion)
}, DEFAULT_DB_VERSION)

const osType = createReducer({
  [submitConfiguration]: (state, {osType}) => osType
}, OS_LINUX)

const dbType = createReducer({
  [submitConfiguration]: (state, {dbType}) => dbType
}, DB_TYPE_WEB)

const totalMemory = createReducer({
  [submitConfiguration]: (state, {totalMemory}) => parseInt(totalMemory, 10)
}, null)

const totalMemoryUnit = createReducer({
  [submitConfiguration]: (state, {totalMemoryUnit}) => totalMemoryUnit
}, SIZE_UNIT_GB)

const cpuNum = createReducer({
  [submitConfiguration]: (state, payload) => (
    payload.cpuNum ? parseInt(payload.cpuNum, 10) : null
  )
}, null)

const connectionNum = createReducer({
  [submitConfiguration]: (state, payload) => (
    payload.connectionNum ? parseInt(payload.connectionNum, 10) : null
  )
}, null)

const hdType = createReducer({
  [submitConfiguration]: (state, {hdType}) => hdType
}, HARD_DRIVE_HDD)

export const reducer = combineReducers({
  dbVersion,
  osType,
  dbType,
  totalMemory,
  totalMemoryUnit,
  cpuNum,
  connectionNum,
  hdType
})
