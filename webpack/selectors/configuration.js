import {createSelector} from 'reselect'
import {
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED,
  OS_WINDOWS
} from 'reducers/configuration/constants'

const SIZE_UNIT_MAP = {
  KB: 1024,
  MB: 1048576,
  GB: 1073741824,
  TB: 1099511627776
}

const getDBVersion = (state) => state.configuration.dbVersion
const getOSType = (state) => state.configuration.osType
const getDBType = (state) => state.configuration.dbType
const getTotalMemory = (state) => state.configuration.totalMemory
const getTotalMemoryUnit = (state) => state.configuration.totalMemoryUnit
const getCPUNum = (state) => state.configuration.cpuNum
const getConnectionNum = (state) => state.configuration.connectionNum
const getHDType = (state) => state.configuration.hdType

const totalMemoryInBytes = createSelector(
  [getTotalMemory, getTotalMemoryUnit],
  (totalMemory, totalMemoryUnit) => (
    totalMemory * SIZE_UNIT_MAP[totalMemoryUnit]
  )
)

export const isMinForConfiguration = createSelector(
  [getTotalMemory],
  (totalMemory) => !!totalMemory
)

export const maxConnections = createSelector(
  [getConnectionNum, getDBType],
  (connectionNum, dbType) => (
    connectionNum ? connectionNum : {
      [DB_TYPE_WEB]: 200,
      [DB_TYPE_OLTP]: 300,
      [DB_TYPE_DW]: 20,
      [DB_TYPE_DESKTOP]: 10,
      [DB_TYPE_MIXED]: 100
    }[dbType]
  )
)

const totalMemoryInKb = createSelector(
  [totalMemoryInBytes],
  (totalMemoryBytes) => (
    totalMemoryBytes / SIZE_UNIT_MAP['KB']
  )
)

export const sharedBuffers = createSelector(
  [totalMemoryInKb, getDBType, getOSType],
  (totalMemoryKb, dbType, osType) => {
    let sharedBuffersValue = {
      [DB_TYPE_WEB]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_OLTP]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_DW]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_MIXED]: Math.floor(totalMemoryKb/ 4)
    }[dbType]
    // Limit shared_buffers to 512MB on Windows
    const windowsMax = 512 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']
    if (OS_WINDOWS === osType && sharedBuffersValue > windowsMax) {
      sharedBuffersValue = windowsMax
    }
    return sharedBuffersValue
  }
)

export const effectiveCacheSize = createSelector(
  [totalMemoryInKb, getDBType],
  (totalMemoryKb, dbType) => ({
    [DB_TYPE_WEB]: Math.floor(totalMemoryKb * 3 / 4),
    [DB_TYPE_OLTP]: Math.floor(totalMemoryKb * 3 / 4),
    [DB_TYPE_DW]: Math.floor(totalMemoryKb * 3 / 4),
    [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 4),
    [DB_TYPE_MIXED]: Math.floor(totalMemoryKb * 3 / 4)
  }[dbType])
)
