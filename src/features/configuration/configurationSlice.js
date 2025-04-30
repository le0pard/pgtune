import { createSlice, createSelector } from '@reduxjs/toolkit'
import { submitConfiguration } from '@app/actions/configurator'
import {
  DEFAULT_DB_VERSION,
  OS_LINUX,
  OS_WINDOWS,
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED,
  SIZE_UNIT_GB,
  HARD_DRIVE_SSD,
  HARD_DRIVE_HDD,
  HARD_DRIVE_SAN
} from './constants'

const SIZE_UNIT_MAP = {
  KB: 1024,
  MB: 1048576,
  GB: 1073741824,
  TB: 1099511627776
}

const DEFAULT_DB_SETTINGS = {
  default: {
    ['max_worker_processes']: 8,
    ['max_parallel_workers_per_gather']: 2,
    ['max_parallel_workers']: 8
  }
}

// redux

const initialState = {
  dbVersion: DEFAULT_DB_VERSION,
  osType: OS_LINUX,
  dbType: DB_TYPE_WEB,
  totalMemory: null,
  totalMemoryUnit: SIZE_UNIT_GB,
  cpuNum: null,
  connectionNum: null,
  hdType: HARD_DRIVE_SSD
}

const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    resetConfiguration: () => {
      return {
        ...initialState
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(submitConfiguration, (_state, { payload }) => {
      return {
        dbVersion: parseFloat(payload.dbVersion),
        osType: payload.osType,
        dbType: payload.dbType,
        totalMemory: parseInt(payload.totalMemory, 10),
        totalMemoryUnit: payload.totalMemoryUnit,
        cpuNum: payload.cpuNum ? parseInt(payload.cpuNum, 10) : null,
        connectionNum: payload.connectionNum ? parseInt(payload.connectionNum, 10) : null,
        hdType: payload.hdType
      }
    })
  }
})

export const { resetConfiguration } = configurationSlice.actions

// selectors

const selectConfiguration = (state) => state.configuration

export const selectDBVersion = (state) => selectConfiguration(state).dbVersion
export const selectOSType = (state) => selectConfiguration(state).osType
export const selectDBType = (state) => selectConfiguration(state).dbType
export const selectTotalMemory = (state) => selectConfiguration(state).totalMemory
export const selectTotalMemoryUnit = (state) => selectConfiguration(state).totalMemoryUnit
export const selectCPUNum = (state) => selectConfiguration(state).cpuNum || null
export const selectConnectionNum = (state) => selectConfiguration(state).connectionNum || null
export const selectHDType = (state) => selectConfiguration(state).hdType

const selectTotalMemoryInBytes = createSelector(
  [selectTotalMemory, selectTotalMemoryUnit],
  (totalMemory, totalMemoryUnit) => totalMemory * SIZE_UNIT_MAP[totalMemoryUnit]
)

const selectTotalMemoryInKb = createSelector(
  [selectTotalMemoryInBytes],
  (totalMemoryBytes) => totalMemoryBytes / SIZE_UNIT_MAP['KB']
)

const selectDbDefaultValues = createSelector(
  [selectDBVersion],
  (dbVersion) => DEFAULT_DB_SETTINGS[dbVersion] || DEFAULT_DB_SETTINGS.default
)

export const selectIsConfigured = createSelector(
  [selectTotalMemory],
  (totalMemory) => !!totalMemory
)

export const selectMaxConnections = createSelector(
  [selectConnectionNum, selectDBType],
  (connectionNum, dbType) =>
    connectionNum
      ? connectionNum
      : {
          [DB_TYPE_WEB]: 200,
          [DB_TYPE_OLTP]: 300,
          [DB_TYPE_DW]: 40,
          [DB_TYPE_DESKTOP]: 20,
          [DB_TYPE_MIXED]: 100
        }[dbType]
)

export const selectHugePages = createSelector(
  [selectTotalMemoryInKb],
  // more 32GB - better also have huge page
  (totalMemoryKBytes) => (totalMemoryKBytes >= 33554432 ? 'try' : 'off')
)

export const selectSharedBuffers = createSelector(
  [selectTotalMemoryInKb, selectDBType, selectOSType, selectDBVersion],
  (totalMemoryKb, dbType, osType, dbVersion) => {
    let sharedBuffersValue = {
      [DB_TYPE_WEB]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_OLTP]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_DW]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_MIXED]: Math.floor(totalMemoryKb / 4)
    }[dbType]
    if (dbVersion < 10 && OS_WINDOWS === osType) {
      // Limit shared_buffers to 512MB on Windows
      const winMemoryLimit = (512 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
      if (sharedBuffersValue > winMemoryLimit) {
        sharedBuffersValue = winMemoryLimit
      }
    }
    return sharedBuffersValue
  }
)

export const selectEffectiveCacheSize = createSelector(
  [selectTotalMemoryInKb, selectDBType],
  (totalMemoryKb, dbType) =>
    ({
      [DB_TYPE_WEB]: Math.floor((totalMemoryKb * 3) / 4),
      [DB_TYPE_OLTP]: Math.floor((totalMemoryKb * 3) / 4),
      [DB_TYPE_DW]: Math.floor((totalMemoryKb * 3) / 4),
      [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_MIXED]: Math.floor((totalMemoryKb * 3) / 4)
    })[dbType]
)

export const selectMaintenanceWorkMem = createSelector(
  [selectTotalMemoryInKb, selectDBType, selectOSType],
  (totalMemoryKb, dbType, osType) => {
    let maintenanceWorkMemValue = {
      [DB_TYPE_WEB]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_OLTP]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_DW]: Math.floor(totalMemoryKb / 8),
      [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_MIXED]: Math.floor(totalMemoryKb / 16)
    }[dbType]
    // Cap maintenance RAM at 2GB on servers with lots of memory
    const memoryLimit = (2 * SIZE_UNIT_MAP['GB']) / SIZE_UNIT_MAP['KB']
    if (maintenanceWorkMemValue >= memoryLimit) {
      if (OS_WINDOWS === osType) {
        // 2048MB (2 GB) will raise error at Windows, so we need remove 1 MB from it
        maintenanceWorkMemValue = memoryLimit - (1 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
      } else {
        maintenanceWorkMemValue = memoryLimit
      }
    }
    return maintenanceWorkMemValue
  }
)

export const selectCheckpointSegments = createSelector([selectDBType], (dbType) => {
  return [
    {
      key: 'min_wal_size',
      value: {
        [DB_TYPE_WEB]: (1024 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'],
        [DB_TYPE_OLTP]: (2048 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'],
        [DB_TYPE_DW]: (4096 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'],
        [DB_TYPE_DESKTOP]: (100 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'],
        [DB_TYPE_MIXED]: (1024 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
      }[dbType]
    },
    {
      key: 'max_wal_size',
      value: {
        [DB_TYPE_WEB]: (4096 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'],
        [DB_TYPE_OLTP]: (8192 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'],
        [DB_TYPE_DW]: (16384 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'],
        [DB_TYPE_DESKTOP]: (2048 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB'],
        [DB_TYPE_MIXED]: (4096 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
      }[dbType]
    }
  ]
})

export const selectCheckpointCompletionTarget = createSelector(
  [],
  () => 0.9 // based on https://github.com/postgres/postgres/commit/bbcc4eb2
)

export const selectWalBuffers = createSelector([selectSharedBuffers], (sharedBuffersValue) => {
  // Follow auto-tuning guideline for wal_buffers added in 9.1, where it's
  // set to 3% of shared_buffers up to a maximum of 16MB.
  let walBuffersValue = Math.floor((3 * sharedBuffersValue) / 100)
  const maxWalBuffer = (16 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
  if (walBuffersValue > maxWalBuffer) {
    walBuffersValue = maxWalBuffer
  }
  // It's nice of wal_buffers is an even 16MB if it's near that number. Since
  // that is a common case on Windows, where shared_buffers is clipped to 512MB,
  // round upwards in that situation
  const walBufferNearValue = (14 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
  if (walBuffersValue > walBufferNearValue && walBuffersValue < maxWalBuffer) {
    walBuffersValue = maxWalBuffer
  }
  // if less, than 32 kb, than set it to minimum
  if (walBuffersValue < 32) {
    walBuffersValue = 32
  }
  return walBuffersValue
})

export const selectDefaultStatisticsTarget = createSelector(
  [selectDBType],
  (dbType) =>
    ({
      [DB_TYPE_WEB]: 100,
      [DB_TYPE_OLTP]: 100,
      [DB_TYPE_DW]: 500,
      [DB_TYPE_DESKTOP]: 100,
      [DB_TYPE_MIXED]: 100
    })[dbType]
)

export const selectRandomPageCost = createSelector([selectHDType], (hdType) => {
  return {
    [HARD_DRIVE_HDD]: 4,
    [HARD_DRIVE_SSD]: 1.1,
    [HARD_DRIVE_SAN]: 1.1
  }[hdType]
})

export const selectEffectiveIoConcurrency = createSelector(
  [selectOSType, selectHDType],
  (osType, hdType) => {
    if (osType !== OS_LINUX) {
      return null
    }
    return {
      [HARD_DRIVE_HDD]: 2,
      [HARD_DRIVE_SSD]: 200,
      [HARD_DRIVE_SAN]: 300
    }[hdType]
  }
)

export const selectParallelSettings = createSelector(
  [selectDBVersion, selectDBType, selectCPUNum],
  (dbVersion, dbType, cpuNum) => {
    if (!cpuNum || cpuNum < 4) {
      return []
    }

    let workersPerGather = Math.ceil(cpuNum / 2)

    if (dbType !== DB_TYPE_DW && workersPerGather > 4) {
      workersPerGather = 4 // no clear evidence, that each new worker will provide big benefit for each noew core
    }

    let config = [
      {
        key: 'max_worker_processes',
        value: cpuNum
      },
      {
        key: 'max_parallel_workers_per_gather',
        value: workersPerGather
      }
    ]

    if (dbVersion >= 10) {
      config.push({
        key: 'max_parallel_workers',
        value: cpuNum
      })
    }

    if (dbVersion >= 11) {
      let parallelMaintenanceWorkers = Math.ceil(cpuNum / 2)

      if (parallelMaintenanceWorkers > 4) {
        parallelMaintenanceWorkers = 4 // no clear evidence, that each new worker will provide big benefit for each noew core
      }

      config.push({
        key: 'max_parallel_maintenance_workers',
        value: parallelMaintenanceWorkers
      })
    }

    return config
  }
)

export const selectWorkMem = createSelector(
  [
    selectTotalMemoryInKb,
    selectSharedBuffers,
    selectMaxConnections,
    selectParallelSettings,
    selectDbDefaultValues,
    selectDBType
  ],
  (
    totalMemoryKb,
    sharedBuffersValue,
    maxConnectionsValue,
    parallelSettingsValue,
    dbDefaultValues,
    dbType
  ) => {
    const parallelForWorkMem = (() => {
      if (parallelSettingsValue.length) {
        const maxWorkerProcesses = parallelSettingsValue.find(
          (param) => param['key'] === 'max_worker_processes'
        )
        if (
          maxWorkerProcesses &&
          maxWorkerProcesses['value'] &&
          maxWorkerProcesses['value'] > 0
        ) {
          return maxWorkerProcesses['value']
        }
      }
      if (
        dbDefaultValues['max_worker_processes'] &&
        dbDefaultValues['max_worker_processes'] > 0
      ) {
        return dbDefaultValues['max_worker_processes']
      }
      return 1
    })()
    // work_mem is assigned any time a query calls for a sort, or a hash, or any other structure that needs a space allocation, which can happen multiple times per query. So you're better off assuming max_connections * 2 or max_connections * 3 is the amount of RAM that will actually use in reality. At the very least, you need to subtract shared_buffers from the amount you're distributing to connections in work_mem.
    // The other thing to consider is that there's no reason to run on the edge of available memory. If you do that, there's a very high risk the out-of-memory killer will come along and start killing PostgreSQL backends. Always leave a buffer of some kind in case of spikes in memory usage. So your maximum amount of memory available in work_mem should be (RAM - shared_buffers) / (max_connections + max_worker_processes) * 3)).
    const workMemValue =
      (totalMemoryKb - sharedBuffersValue) / ((maxConnectionsValue + parallelForWorkMem) * 3)
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

export const selectWarningInfoMessages = createSelector(
  [selectTotalMemoryInBytes],
  (totalMemory) => {
    if (totalMemory < 256 * SIZE_UNIT_MAP['MB']) {
      return ['WARNING', 'this tool not being optimal', 'for low memory systems']
    }
    if (totalMemory > 100 * SIZE_UNIT_MAP['GB']) {
      return ['WARNING', 'this tool not being optimal', 'for very high memory systems']
    }
    return []
  }
)

export const selectWalLevel = createSelector([selectDBType], (dbType) => {
  if (dbType === DB_TYPE_DESKTOP) {
    return [
      {
        key: 'wal_level',
        value: 'minimal'
      },
      // max_wal_senders must be 0 when wal_level=minimal
      {
        key: 'max_wal_senders',
        value: '0'
      }
    ]
  }

  return []
})

// Export the slice reducer as the default export
export default configurationSlice.reducer
