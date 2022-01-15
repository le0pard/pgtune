import {combineReducers} from 'redux'
import {createAction, createReducer} from 'redux-act'
import {
  DEFAULT_DB_VERSION,
  OS_LINUX,
  DB_TYPE_WEB,
  SIZE_UNIT_GB,
  HARD_DRIVE_SSD
} from 'reducers/configuration/constants'

export const submitConfiguration = createAction('Submit hardware configuration')
export const resetConfiguration = createAction('Reset hardware configuration')

const dbVersion = createReducer({
  [submitConfiguration]: (_state, payload) => parseFloat(payload.dbVersion),
  [resetConfiguration]: () => DEFAULT_DB_VERSION
}, DEFAULT_DB_VERSION)

const osType = createReducer({
  [submitConfiguration]: (_state, payload) => payload.osType,
  [resetConfiguration]: () => OS_LINUX
}, OS_LINUX)

const dbType = createReducer({
  [submitConfiguration]: (_state, payload) => payload.dbType,
  [resetConfiguration]: () => DB_TYPE_WEB
}, DB_TYPE_WEB)

const totalMemory = createReducer({
  [submitConfiguration]: (_state, payload) => parseInt(payload.totalMemory, 10),
  [resetConfiguration]: () => null
}, null)

const totalMemoryUnit = createReducer({
  [submitConfiguration]: (_state, payload) => payload.totalMemoryUnit,
  [resetConfiguration]: () => SIZE_UNIT_GB
}, SIZE_UNIT_GB)

const cpuNum = createReducer({
  [submitConfiguration]: (_state, payload) => (
    payload.cpuNum ? parseInt(payload.cpuNum, 10) : null
  ),
  [resetConfiguration]: () => null
}, null)

const connectionNum = createReducer({
  [submitConfiguration]: (_state, payload) => (
    payload.connectionNum ? parseInt(payload.connectionNum, 10) : null
  ),
  [resetConfiguration]: () => null
}, null)

const hdType = createReducer({
  [submitConfiguration]: (_state, payload) => payload.hdType,
  [resetConfiguration]: () => HARD_DRIVE_SSD
}, HARD_DRIVE_SSD)

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
