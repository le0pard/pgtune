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
  [submitConfiguration]: (state, payload) => parseFloat(payload.dbVersion)
}, DEFAULT_DB_VERSION)

const osType = createReducer({
  [submitConfiguration]: (state, payload) => payload.osType
}, OS_LINUX)

const dbType = createReducer({
  [submitConfiguration]: (state, payload) => payload.dbType
}, DB_TYPE_WEB)

const totalMemory = createReducer({
  [submitConfiguration]: (state, payload) => parseInt(payload.totalMemory, 10)
}, null)

const totalMemoryUnit = createReducer({
  [submitConfiguration]: (state, payload) => payload.totalMemoryUnit
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
  [submitConfiguration]: (state, payload) => payload.hdType
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
