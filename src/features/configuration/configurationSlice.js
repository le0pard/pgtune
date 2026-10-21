import { createSlice, createSelector } from '@reduxjs/toolkit'
import { submitConfiguration } from '@app/actions/configurator'
import {
  DEFAULT_DB_VERSION,
  OS_LINUX,
  OS_WINDOWS,
  OS_MAC,
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED,
  SIZE_UNIT_GB,
  HARD_DRIVE_SSD,
  HARD_DRIVE_HDD,
  HARD_DRIVE_SAN,
  HARD_DRIVE_NVME,
  DB_SIZE_LESS_RAM,
  DB_SIZE_MID_RAM,
  DB_SIZE_GREATER_RAM
} from './constants'

const SIZE_UNIT_MAP = {
  KB: 1024,
  MB: 1048576,
  GB: 1073741824,
  TB: 1099511627776,
  PB: 1125899906842624
}

const DEFAULT_DB_SETTINGS = {
  default: {
    ['max_connections']: 100,
    ['max_worker_processes']: 8,
    ['max_parallel_workers_per_gather']: 2,
    ['max_parallel_workers']: 8
  }
}

// PostgreSQL limit for max_parallel_workers (MAX_PARALLEL_WORKER_LIMIT)
const MAX_PARALLEL_WORKERS = 1024

// Modern floor limit: 4 MB minimum to prevent disk-spill for simple queries
const MIN_WORK_MEM = (4 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']

// Settings, which take effect only after server restart
const RESTART_REQUIRED_SETTINGS = [
  'max_connections',
  'shared_buffers',
  'wal_buffers',
  'max_worker_processes',
  'wal_level',
  'max_wal_senders',
  'io_method'
]

// Memory values (in kB) are rounded down to whole megabytes to keep config readable
const roundDownToMb = (valueKb) =>
  Math.floor(valueKb / (SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB'])) *
  (SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB'])

// redux

const initialState = {
  dbVersion: DEFAULT_DB_VERSION,
  osType: OS_LINUX,
  dbType: DB_TYPE_WEB,
  totalMemory: null,
  totalMemoryUnit: SIZE_UNIT_GB,
  cpuNum: null,
  connectionNum: null,
  hdType: HARD_DRIVE_SSD,
  dbSize: DB_SIZE_MID_RAM
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
        hdType: payload.hdType,
        dbSize: payload.dbSize
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
export const selectDBSize = (state) => selectConfiguration(state).dbSize

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

export const selectRestartRequiredSettings = createSelector([selectDBVersion], (dbVersion) =>
  // autovacuum_max_workers can be changed by reload since PostgreSQL 18
  dbVersion < 18
    ? [...RESTART_REQUIRED_SETTINGS, 'autovacuum_max_workers']
    : RESTART_REQUIRED_SETTINGS
)

export const selectSharedBuffers = createSelector(
  [selectTotalMemoryInKb, selectDBType],
  (totalMemoryKb, dbType) =>
    roundDownToMb(
      {
        [DB_TYPE_WEB]: Math.floor(totalMemoryKb / 4),
        [DB_TYPE_OLTP]: Math.floor(totalMemoryKb / 4),
        [DB_TYPE_DW]: Math.floor(totalMemoryKb / 4),
        [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 16),
        [DB_TYPE_MIXED]: Math.floor(totalMemoryKb / 4)
      }[dbType]
    )
)

const selectIsHugePagesRecommended = createSelector(
  [selectSharedBuffers, selectOSType],
  (sharedBuffersValue, osType) => {
    // macOS does not support PostgreSQL huge pages
    if (osType === OS_MAC) {
      return false
    }
    // huge_pages = try is PostgreSQL default, but huge pages need to be reserved in OS
    const hugePageThreshold = (2 * SIZE_UNIT_MAP['GB']) / SIZE_UNIT_MAP['KB']
    return sharedBuffersValue >= hugePageThreshold
  }
)

export const selectEffectiveCacheSize = createSelector(
  [selectTotalMemoryInKb, selectDBType],
  (totalMemoryKb, dbType) =>
    roundDownToMb(
      {
        [DB_TYPE_WEB]: Math.floor((totalMemoryKb * 3) / 4),
        [DB_TYPE_OLTP]: Math.floor((totalMemoryKb * 3) / 4),
        [DB_TYPE_DW]: Math.floor((totalMemoryKb * 3) / 4),
        [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 4),
        [DB_TYPE_MIXED]: Math.floor((totalMemoryKb * 3) / 4)
      }[dbType]
    )
)

export const selectMaintenanceWorkMem = createSelector(
  [selectTotalMemoryInKb, selectDBType, selectOSType, selectDBVersion],
  (totalMemoryKb, dbType, osType, dbVersion) => {
    let maintenanceWorkMemValue = roundDownToMb(
      {
        [DB_TYPE_WEB]: Math.floor(totalMemoryKb / 16),
        [DB_TYPE_OLTP]: Math.floor(totalMemoryKb / 16),
        [DB_TYPE_DW]: Math.floor(totalMemoryKb / 8),
        [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 16),
        [DB_TYPE_MIXED]: Math.floor(totalMemoryKb / 16)
      }[dbType]
    )
    // Default cap is 8GB on modern servers with lots of memory
    let memoryLimit = (8 * SIZE_UNIT_MAP['GB']) / SIZE_UNIT_MAP['KB']

    // Windows 64-bit has a strict 2GB limit up to PostgreSQL 17
    if (OS_WINDOWS === osType && dbVersion <= 17) {
      memoryLimit = (2 * SIZE_UNIT_MAP['GB']) / SIZE_UNIT_MAP['KB']
    }

    if (maintenanceWorkMemValue >= memoryLimit) {
      if (OS_WINDOWS === osType && dbVersion <= 17) {
        // 2048MB (2 GB) will raise an error on Windows PG <= 17, so we need to remove 1 MB from it
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
  [selectDBVersion],
  // based on https://github.com/postgres/postgres/commit/bbcc4eb2,
  // which made 0.9 the default since PostgreSQL 14
  (dbVersion) => (dbVersion < 14 ? 0.9 : null)
)

export const selectWalBuffers = createSelector([selectSharedBuffers], (sharedBuffersValue) => {
  // Same value as PostgreSQL picks automatically (wal_buffers = -1): 1/32 of
  // shared_buffers in 8kB pages, not less than 64kB and not more than
  // one WAL segment (16MB)
  const walBuffersValue = Math.floor(sharedBuffersValue / 8 / 32) * 8
  const maxWalBuffer = (16 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
  return Math.min(Math.max(walBuffersValue, 64), maxWalBuffer)
})

export const selectDefaultStatisticsTarget = createSelector(
  [selectDBType],
  // other types keep PostgreSQL default (100)
  (dbType) => (dbType === DB_TYPE_DW ? 500 : null)
)

export const selectRandomPageCost = createSelector(
  [selectHDType, selectDBSize, selectDBType],
  (hdType, dbSize, dbType) => {
    // If the entire database fits in RAM, all read requests will be served
    // from the OS page cache. Disk seek time (even for HDD) becomes irrelevant.
    if (dbSize === DB_SIZE_LESS_RAM) {
      return 1.1
    }

    // HDD always gets 4.0
    if (hdType === HARD_DRIVE_HDD) {
      return 4
    }

    // For Data Warehouses that don't fit in RAM, a low random_page_cost is dangerous.
    // It causes the planner to pick index scans for large data retrievals, which
    // are much slower on physical SSDs than sequential scans.
    // Return 4.0 (the Postgres default) to prevent this harm
    if (dbType === DB_TYPE_DW) {
      return 4
    }

    return 1.1
  }
)

export const selectEffectiveIoConcurrency = createSelector(
  [selectOSType, selectHDType, selectDBVersion],
  (osType, hdType, dbVersion) => {
    // Before PostgreSQL 18 non-zero value is rejected on platforms without
    // posix_fadvise (macOS, Windows). Asynchronous I/O in PostgreSQL 18 removed this limitation
    if (osType !== OS_LINUX && dbVersion < 18) {
      return null
    }
    return {
      [HARD_DRIVE_HDD]: 2,
      [HARD_DRIVE_SSD]: 200,
      [HARD_DRIVE_SAN]: 300,
      [HARD_DRIVE_NVME]: 1000
    }[hdType]
  }
)

export const selectMaintenanceIoConcurrency = createSelector(
  [selectEffectiveIoConcurrency, selectDBVersion],
  // maintenance_io_concurrency was added in PostgreSQL 13. Same storage, same concurrency
  (effectiveIoConcurrencyValue, dbVersion) =>
    dbVersion >= 13 && effectiveIoConcurrencyValue ? effectiveIoConcurrencyValue : null
)

export const selectParallelSettings = createSelector(
  [selectDBVersion, selectDBType, selectCPUNum, selectDbDefaultValues],
  (dbVersion, dbType, cpuNum, dbDefaultValues) => {
    if (!cpuNum || cpuNum < 4) {
      return []
    }

    const parallelWorkers = Math.min(cpuNum, MAX_PARALLEL_WORKERS)

    let workersPerGather = Math.ceil(parallelWorkers / 2)

    if (dbType === DB_TYPE_DW) {
      // with half of workers per query, the third concurrent query gets no workers at all,
      // so keep enough workers for at least 4 parallel queries at the same time
      workersPerGather = Math.min(workersPerGather, Math.max(4, Math.floor(parallelWorkers / 4)))
    } else if (workersPerGather > 4) {
      workersPerGather = 4 // no clear evidence, that each new worker will provide big benefit for each noew core
    }

    let config = [
      {
        key: 'max_worker_processes',
        // Never lower than PostgreSQL default: logical replication and extensions
        // take their background workers from the same pool
        value: Math.max(parallelWorkers, dbDefaultValues['max_worker_processes'])
      },
      {
        key: 'max_parallel_workers_per_gather',
        value: workersPerGather
      }
    ]

    if (dbVersion >= 10) {
      config.push({
        key: 'max_parallel_workers',
        value: parallelWorkers
      })
    }

    if (dbVersion >= 11) {
      let parallelMaintenanceWorkers = Math.ceil(parallelWorkers / 2)

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

// Number of parallel workers, which can run queries (and use work_mem) at the same time
const selectParallelWorkersForWorkMem = createSelector(
  [selectParallelSettings, selectDbDefaultValues],
  (parallelSettingsValue, dbDefaultValues) => {
    const maxParallelWorkers = parallelSettingsValue.find(
      (param) => param['key'] === 'max_parallel_workers'
    )
    if (maxParallelWorkers && maxParallelWorkers['value'] > 0) {
      return maxParallelWorkers['value']
    }
    return dbDefaultValues['max_parallel_workers']
  }
)

export const selectMaxConnections = createSelector(
  [
    selectConnectionNum,
    selectDBType,
    selectTotalMemoryInKb,
    selectSharedBuffers,
    selectParallelWorkersForWorkMem,
    selectDbDefaultValues
  ],
  (connectionNum, dbType, totalMemoryKb, sharedBuffersValue, parallelWorkers, dbDefaultValues) => {
    if (connectionNum) {
      return connectionNum
    }

    const dbTypeConnections = {
      [DB_TYPE_WEB]: 200,
      [DB_TYPE_OLTP]: 300,
      [DB_TYPE_DW]: 100,
      [DB_TYPE_DESKTOP]: 100,
      [DB_TYPE_MIXED]: 100
    }[dbType]

    // Connections, which fit in memory with minimal work_mem (see selectWorkMemBudget)
    const connectionsFitInMemory =
      Math.floor((totalMemoryKb - sharedBuffersValue) / (MIN_WORK_MEM * 3)) - parallelWorkers

    // Never lower than PostgreSQL default: application can fail with "too many clients"
    return Math.max(
      dbDefaultValues['max_connections'],
      Math.min(dbTypeConnections, connectionsFitInMemory)
    )
  }
)

// work_mem is assigned any time a query calls for a sort, or a hash, or any other structure that needs a space allocation, which can happen multiple times per query. So you're better off assuming max_connections * 2 or max_connections * 3 is the amount of RAM that will actually use in reality. At the very least, you need to subtract shared_buffers from the amount you're distributing to connections in work_mem.
// The other thing to consider is that there's no reason to run on the edge of available memory. If you do that, there's a very high risk the out-of-memory killer will come along and start killing PostgreSQL backends. Always leave a buffer of some kind in case of spikes in memory usage. So your maximum amount of memory available in work_mem should be (RAM - shared_buffers) / ((max_connections + max_parallel_workers) * 3).
const selectWorkMemBudget = createSelector(
  [
    selectTotalMemoryInKb,
    selectSharedBuffers,
    selectMaxConnections,
    selectParallelWorkersForWorkMem
  ],
  (totalMemoryKb, sharedBuffersValue, maxConnectionsValue, parallelWorkers) =>
    (totalMemoryKb - sharedBuffersValue) / ((maxConnectionsValue + parallelWorkers) * 3)
)

export const selectWorkMem = createSelector(
  [selectWorkMemBudget, selectDBType, selectOSType, selectDBVersion, selectDBSize],
  (workMemValue, dbType, osType, dbVersion, dbSize) => {
    let workMemResult = {
      [DB_TYPE_WEB]: Math.floor(workMemValue),
      [DB_TYPE_OLTP]: Math.floor(workMemValue),
      [DB_TYPE_DW]: Math.floor(workMemValue / 2),
      [DB_TYPE_DESKTOP]: Math.floor(workMemValue / 6),
      [DB_TYPE_MIXED]: Math.floor(workMemValue / 2)
    }[dbType]

    if (dbSize === DB_SIZE_LESS_RAM) {
      // OS Cache is underutilized because the DB fits entirely in RAM.
      // We can safely boost work_mem by 30% to speed up sorts/hashes.
      workMemResult = Math.floor(workMemResult * 1.3)
    } else if (dbSize === DB_SIZE_GREATER_RAM) {
      // OS Cache is under massive pressure. We must protect memory.
      // Reduce work_mem by 10% to provide a wider safety net against OOM spikes.
      workMemResult = Math.floor(workMemResult * 0.9)
    }

    workMemResult = roundDownToMb(workMemResult)

    if (workMemResult < MIN_WORK_MEM) {
      workMemResult = MIN_WORK_MEM
    }

    // Windows 64-bit has a strict 2GB limit up to PostgreSQL 17
    if (osType === OS_WINDOWS && dbVersion <= 17) {
      const winMemoryLimit =
        (2 * SIZE_UNIT_MAP['GB']) / SIZE_UNIT_MAP['KB'] -
        (1 * SIZE_UNIT_MAP['MB']) / SIZE_UNIT_MAP['KB']
      if (workMemResult > winMemoryLimit) {
        workMemResult = winMemoryLimit
      }
    }

    return workMemResult
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

export const selectJit = createSelector([selectDBVersion, selectDBType], (dbVersion, dbType) => {
  // JIT compilation is enabled by default in PG 12 - 18. For OLTP/Web workloads,
  // it routinely causes CPU spikes and slow planning for simple, short queries.
  // JIT compilation is beneficial primarily for long-running CPU-bound queries. Frequently these will be analytical queries.
  // PG 19+ disables JIT by default.
  if (
    dbVersion >= 12 &&
    dbVersion < 19 &&
    [DB_TYPE_WEB, DB_TYPE_OLTP, DB_TYPE_MIXED].includes(dbType)
  ) {
    return 'off'
  }
  return null // Omit for dw/desktop so it uses the PG default
})

export const selectWalCompression = createSelector([selectDBVersion], (dbVersion) => {
  // PG 19+ 'on' picks the best compression method available in the build
  if (dbVersion >= 19) {
    return 'on'
  }
  // PG 15+ introduced lz4 and zstd support. lz4 is significantly faster
  // and lighter on CPU than the native pglz algorithm. Standard package
  // installations compile with lz4 support by default.
  if (dbVersion >= 15) {
    return 'lz4'
  }
  // For PG 10 through 14, 'on' safely enables pglz compression.
  if (dbVersion >= 10) {
    return 'on'
  }
  return null
})

export const selectAutovacuumMaxWorkers = createSelector([selectCPUNum], (cpuNum) => {
  // PG default is 3. We only safely scale it up on heavier servers.
  if (!cpuNum) return null
  if (cpuNum >= 32) return 5
  if (cpuNum >= 16) return 4
  return null
})

export const selectAutovacuumWorkMem = createSelector(
  [selectMaintenanceWorkMem],
  (maintenanceWorkMemValue) => {
    // By default, autovacuum_work_mem is -1 (uses maintenance_work_mem).
    // Because we safely raised maintenance_work_mem to up to 8GB, letting 3-5 background
    // workers each consume it would cause severe OOM risks. Before PostgreSQL 17 vacuum
    // can not use more than 1GB for dead tuples, and PostgreSQL 17+ stores them much more
    // compactly, so we cap background vacuum memory to 1GB per worker.
    const threshold = (1 * SIZE_UNIT_MAP['GB']) / SIZE_UNIT_MAP['KB']
    return maintenanceWorkMemValue > threshold ? threshold : null
  }
)

export const selectIoMethod = createSelector(
  [selectDBVersion, selectOSType],
  (dbVersion, osType) => {
    // Asynchronous I/O was introduced in PostgreSQL 18
    if (dbVersion < 18) {
      return null
    }

    // If we assume standard modern packages (compiled with --with-liburing),
    // io_uring is the absolute best performing AIO method for Linux.
    if (osType === OS_LINUX) {
      return 'io_uring'
    }

    // Windows and macOS do not support io_uring natively, so we keep
    // the PostgreSQL default 'worker' processes.
    return null
  }
)

export const selectIoWorkers = createSelector(
  [selectDBVersion, selectCPUNum, selectIoMethod],
  (dbVersion, cpuNum, ioMethod) => {
    // I/O workers were introduced in PG18 for the new Asynchronous I/O subsystem
    if (dbVersion < 18 || !cpuNum || ioMethod === 'io_uring') {
      return []
    }

    // We conservatively scale it to ~25% of CPU cores to avoid
    // lock contention on the AIO queue, capped at PostgreSQL's hard max of 32
    const ioWorkersValue = Math.min(32, Math.floor(cpuNum / 4))

    // PG19 starts and stops I/O workers automatically, between io_min_workers
    // and io_max_workers (default 8). PG18 uses fixed io_workers (default 3).
    const ioWorkersSetting =
      dbVersion >= 19 ? { key: 'io_max_workers', default: 8 } : { key: 'io_workers', default: 3 }

    // Only explicitly configure it if we are recommending more than the default
    return ioWorkersValue > ioWorkersSetting.default
      ? [{ key: ioWorkersSetting.key, value: ioWorkersValue }]
      : []
  }
)

export const selectWarningInfoMessages = createSelector(
  [
    selectTotalMemoryInBytes,
    selectDBVersion,
    selectOSType,
    selectDBType,
    selectHDType,
    selectDBSize,
    selectMaxConnections,
    selectWorkMemBudget,
    selectIsHugePagesRecommended,
    selectWalLevel,
    selectWalCompression,
    selectIoMethod
  ],
  (
    totalMemory,
    dbVersion,
    osType,
    dbType,
    hdType,
    dbSize,
    maxConnections,
    workMemBudget,
    isHugePagesRecommended,
    walLevel,
    walCompression,
    ioMethod
  ) => {
    let warnings = []

    const addWarning = (...lines) => {
      if (warnings.length > 0) warnings.push('')

      warnings.push(...lines)
    }

    // Memory warnings
    if (totalMemory < 1 * SIZE_UNIT_MAP['GB']) {
      addWarning('this tool not being optimal', 'for low memory systems')
    } else if (totalMemory > 100 * SIZE_UNIT_MAP['GB']) {
      addWarning('this tool not being optimal', 'for very high memory systems')
    }

    if (workMemBudget < MIN_WORK_MEM) {
      addWarning(
        `max_connections = ${maxConnections} is too high for this amount of RAM:`,
        'work_mem is raised to 4MB minimum, so under load',
        'PostgreSQL can run out of memory',
        'Lower max_connections or use a connection pooler (e.g. PgBouncer)'
      )
    }

    if (isHugePagesRecommended) {
      if (osType === OS_WINDOWS) {
        addWarning(
          'shared_buffers is large: grant the "Lock pages in memory" right',
          'to the PostgreSQL service account to use huge pages'
        )
      } else {
        addWarning(
          'shared_buffers is large: reserve Linux huge pages (vm.nr_hugepages)',
          'to reduce memory used by page tables of each connection',
          ...(dbVersion >= 15
            ? [
                'Required number (with these settings, while server is stopped):',
                'postgres -D $PGDATA -C shared_memory_size_in_huge_pages'
              ]
            : ['See "Linux Huge Pages" in PostgreSQL documentation to calculate it'])
        )
      }
    }

    if (walLevel.some((item) => item.key === 'wal_level' && item.value === 'minimal')) {
      addWarning(
        'wal_level = minimal: PostgreSQL will not start if archive_mode = on',
        'or if replication slots exist. Replication, pg_basebackup',
        'and point-in-time recovery are not possible'
      )
    }

    // Advanced features compilation warnings
    if (walCompression === 'lz4') {
      addWarning(
        'wal_compression = lz4 requires PostgreSQL',
        'to be compiled with --with-lz4',
        "Check: SELECT enumvals FROM pg_settings WHERE name = 'wal_compression';"
      )
    }

    if (ioMethod === 'io_uring') {
      addWarning(
        'io_method = io_uring requires PostgreSQL',
        'to be compiled with --with-liburing',
        'and io_uring allowed by the kernel (kernel.io_uring_disabled sysctl)',
        'and by containers (Docker default seccomp profile blocks it)',
        "Check: SELECT enumvals FROM pg_settings WHERE name = 'io_method';"
      )
    }

    // I/O Cost Warning for Analytical DBs
    if (dbType === DB_TYPE_DW && hdType !== HARD_DRIVE_HDD && dbSize !== DB_SIZE_LESS_RAM) {
      const driveName = {
        [HARD_DRIVE_SSD]: 'SSDs',
        [HARD_DRIVE_NVME]: 'NVMe drives',
        [HARD_DRIVE_SAN]: 'SAN storage'
      }[hdType]

      addWarning(
        `Cost parameters for Data Warehouses on ${driveName} are left at defaults`,
        'to avoid catastrophic index scan selections',
        'Monitor query planner behavior and adjust random_page_cost if necessary'
      )
    }

    return warnings.length > 0 ? ['WARNING', ...warnings] : []
  }
)

// Export the slice reducer as the default export
export default configurationSlice.reducer
