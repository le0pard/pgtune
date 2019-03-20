import {createSelector} from 'reselect'
import {
  OS_WINDOWS,
  OS_MAC,
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED,
  HARD_DRIVE_HDD,
  HARD_DRIVE_SSD,
  HARD_DRIVE_SAN
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

export const isReadyForConfiguration = createSelector(
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
      [DB_TYPE_MIXED]: Math.floor(totalMemoryKb / 4)
    }[dbType]
    // Limit shared_buffers to 512MB on Windows
    const winMemoryLimit = 512 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']
    if (OS_WINDOWS === osType && sharedBuffersValue > winMemoryLimit) {
      sharedBuffersValue = winMemoryLimit
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

export const maintenanceWorkMem = createSelector(
  [totalMemoryInKb, getDBType, getOSType],
  (totalMemoryKb, dbType, osType) => {
    let maintenanceWorkMemValue = {
      [DB_TYPE_WEB]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_OLTP]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_DW]: Math.floor(totalMemoryKb / 8),
      [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_MIXED]: Math.floor(totalMemoryKb / 16)
    }[dbType]
    // Cap maintenance RAM at 2GB on servers with lots of memory
    const memoryLimit = 2 * SIZE_UNIT_MAP['GB'] / SIZE_UNIT_MAP['KB']
    if (maintenanceWorkMemValue > memoryLimit) {
      if (OS_WINDOWS === osType) {
        // 2048MB (2 GB) will raise error at Windows, so we need remove 1 MB from it
        maintenanceWorkMemValue = memoryLimit - (1 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB'])
      } else {
        maintenanceWorkMemValue = memoryLimit
      }
    }
    return maintenanceWorkMemValue
  }
)

export const checkpointSegments = createSelector(
  [getDBVersion, getDBType],
  (dbVersion, dbType) => {
    if (dbVersion < 9.5) {
      return [
        {
          key: 'checkpoint_segments',
          value: ({
            [DB_TYPE_WEB]: 32,
            [DB_TYPE_OLTP]: 64,
            [DB_TYPE_DW]: 128,
            [DB_TYPE_DESKTOP]: 3,
            [DB_TYPE_MIXED]: 32
          }[dbType])
        }
      ]
    } else {
      return [
        {
          key: 'min_wal_size',
          value: ({
            [DB_TYPE_WEB]: (1024 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_OLTP]: (2048 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_DW]: (4096 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_DESKTOP]: (100 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_MIXED]: (1024 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB'])
          }[dbType])
        },
        {
          key: 'max_wal_size',
          value: ({
            [DB_TYPE_WEB]: (2048 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_OLTP]: (4096 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_DW]: (8192 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_DESKTOP]: (1024 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_MIXED]: (2048 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB'])
          }[dbType])
        }
      ]
    }
  }
)

export const checkpointCompletionTarget = createSelector(
  [getDBType],
  (dbType) => ({
    [DB_TYPE_WEB]: 0.7,
    [DB_TYPE_OLTP]: 0.9,
    [DB_TYPE_DW]: 0.9,
    [DB_TYPE_DESKTOP]: 0.5,
    [DB_TYPE_MIXED]: 0.9
  }[dbType])
)

export const walBuffers = createSelector(
  [sharedBuffers],
  (sharedBuffersValue) => {
    // Follow auto-tuning guideline for wal_buffers added in 9.1, where it's
    // set to 3% of shared_buffers up to a maximum of 16MB.
    let walBuffersValue = Math.floor(3 * sharedBuffersValue / 100)
    const maxWalBuffer = 16 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']
    if (walBuffersValue > maxWalBuffer) {
      walBuffersValue = maxWalBuffer
    }
    // It's nice of wal_buffers is an even 16MB if it's near that number. Since
    // that is a common case on Windows, where shared_buffers is clipped to 512MB,
    // round upwards in that situation
    const walBufferNearValue = 14 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']
    if (walBuffersValue > walBufferNearValue && walBuffersValue < maxWalBuffer) {
      walBuffersValue = maxWalBuffer
    }
    // if less, than 32 kb, than set it to minimum
    if (walBuffersValue < 32) {
      walBuffersValue = 32
    }
    return walBuffersValue
  }
)

export const defaultStatisticsTarget = createSelector(
  [getDBType],
  (dbType) => ({
    [DB_TYPE_WEB]: 100,
    [DB_TYPE_OLTP]: 100,
    [DB_TYPE_DW]: 500,
    [DB_TYPE_DESKTOP]: 100,
    [DB_TYPE_MIXED]: 100
  }[dbType])
)

export const randomPageCost = createSelector(
  [getHDType],
  (hdType) => ({
    [HARD_DRIVE_HDD]: 4,
    [HARD_DRIVE_SSD]: 1.1,
    [HARD_DRIVE_SAN]: 1.1
  }[hdType])
)

export const effectiveIoConcurrency = createSelector(
  [getOSType, getHDType],
  (osType, hdType) => {
    if ([OS_WINDOWS, OS_MAC].indexOf(osType) >= 0) {
      return null
    }
    return {
      [HARD_DRIVE_HDD]: 2,
      [HARD_DRIVE_SSD]: 200,
      [HARD_DRIVE_SAN]: 300
    }[hdType]
  }
)

export const parallelSettings = createSelector(
  [getDBVersion, getCPUNum],
  (dbVersion, cpuNum) => {
    if (dbVersion < 9.5 || cpuNum < 2) {
      return []
    }

    let config = [
      {
        key: 'max_worker_processes',
        value: cpuNum
      }
    ]

    if (dbVersion >= 9.6) {
      config.push({
        key: 'max_parallel_workers_per_gather',
        value: Math.ceil(cpuNum / 2)
      })
    }

    if (dbVersion >= 10) {
      config.push({
        key: 'max_parallel_workers',
        value: cpuNum
      })
    }

    return config
  }
)

export const workMem = createSelector(
  [totalMemoryInKb, sharedBuffers, maxConnections, parallelSettings, getDBType],
  (
    totalMemoryKb, sharedBuffersValue,
    maxConnectionsValue, parallelSettingsValue,
    dbType
  ) => {
    const parallelForWorkMem = (() => {
      if (parallelSettingsValue.length) {
        return Math.ceil(parallelSettingsValue[0].value / 2)
      }
      return 1
    })()
    // work_mem is assigned any time a query calls for a sort, or a hash, or any other structure that needs a space allocation, which can happen multiple times per query. So you're better off assuming max_connections * 2 or max_connections * 3 is the amount of RAM that will actually use in reality. At the very least, you need to subtract shared_buffers from the amount you're distributing to connections in work_mem.
    // The other thing to consider is that there's no reason to run on the edge of available memory. If you do that, there's a very high risk the out-of-memory killer will come along and start killing PostgreSQL backends. Always leave a buffer of some kind in case of spikes in memory usage. So your maximum amount of memory available in work_mem should be ((RAM - shared_buffers) / (max_connections * 3) / max_parallel_workers_per_gather).
    const workMemValue = (
      (totalMemoryKb - sharedBuffersValue) / (maxConnectionsValue * 3) / parallelForWorkMem
    )
    let workMemResult = {
      [DB_TYPE_WEB]: Math.floor(workMemValue),
      [DB_TYPE_OLTP]: Math.floor(workMemValue),
      [DB_TYPE_DW]: Math.floor(workMemValue / 2),
      [DB_TYPE_DESKTOP]: Math.floor(workMemValue / 6),
      [DB_TYPE_MIXED]: Math.floor(workMemValue / 2)
    }[dbType]
    // if less, than 64 kb, than set it to minimum
    if (workMemResult < 64) {
      workMemResult = 64
    }
    return workMemResult
  }
)

export const warningInfoMessages = createSelector(
  [totalMemoryInBytes],
  (totalMemory) => {
    if (totalMemory < 256 * SIZE_UNIT_MAP['MB']) {
      return [
        '# WARNING',
        '# this tool not being optimal',
        '# for low memory systems'
      ]
    }
    if (totalMemory > 100 * SIZE_UNIT_MAP['GB']) {
      return [
        '# WARNING',
        '# this tool not being optimal',
        '# for very high memory systems'
      ]
    }
    return []
  }
)

export const kernelShmall = createSelector(
  [totalMemoryInBytes],
  (totalMemory) => Math.floor(totalMemory / 8192)
)

export const kernelShmmax = createSelector(
  [kernelShmall],
  (kernelShmallVal) => kernelShmallVal * 4096
)
