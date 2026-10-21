import {
  selectMaxConnections,
  selectSharedBuffers,
  selectEffectiveCacheSize,
  selectMaintenanceWorkMem,
  selectCheckpointSegments,
  selectCheckpointCompletionTarget,
  selectWalBuffers,
  selectDefaultStatisticsTarget,
  selectEffectiveIoConcurrency,
  selectMaintenanceIoConcurrency,
  selectParallelSettings,
  selectWorkMem,
  selectJit,
  selectWalCompression,
  selectAutovacuumMaxWorkers,
  selectAutovacuumWorkMem,
  selectIoMethod,
  selectIoWorkers,
  selectWalLevel,
  selectWarningInfoMessages
} from '../configurationSlice'
import {
  DB_VERSIONS,
  OS_LINUX,
  OS_WINDOWS,
  OS_MAC,
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED,
  HARD_DRIVE_SSD,
  HARD_DRIVE_HDD,
  HARD_DRIVE_SAN,
  HARD_DRIVE_NVME,
  DB_SIZE_LESS_RAM,
  DB_SIZE_MID_RAM,
  DB_SIZE_GREATER_RAM,
  MAX_CONNECTIONS_VALUE
} from '../constants'

// PostgreSQL limits from source code
const MAX_BACKENDS = 262143 // total number of server processes
const MAX_PARALLEL_WORKER_LIMIT = 1024
const MAX_IO_WORKERS = 32
const INT_MAX = 2147483647
const MAX_KILOBYTES = INT_MAX // memory settings in kB
const MAX_KILOBYTES_WINDOWS = Math.floor(INT_MAX / 1024) // Windows before PostgreSQL 18
const MAX_SHARED_BUFFERS = Math.floor(INT_MAX / 2) * 8 // 8kB blocks
const MAX_EFFECTIVE_CACHE_SIZE = INT_MAX * 8 // 8kB blocks
const MIN_WORK_MEM = 4096 // pgtune minimum (4MB)

const OS_TYPES = [OS_LINUX, OS_WINDOWS, OS_MAC]
const DB_TYPES = [DB_TYPE_WEB, DB_TYPE_OLTP, DB_TYPE_DW, DB_TYPE_DESKTOP, DB_TYPE_MIXED]
const HARD_DRIVE_TYPES = [HARD_DRIVE_SSD, HARD_DRIVE_HDD, HARD_DRIVE_SAN, HARD_DRIVE_NVME]
const DB_SIZES = [DB_SIZE_LESS_RAM, DB_SIZE_MID_RAM, DB_SIZE_GREATER_RAM]
const MEMORY_SIZES = [
  [512, 'MB'],
  [1000, 'MB'],
  [3, 'GB'],
  [16, 'GB'],
  [256, 'GB'],
  [999999, 'MB'],
  [4, 'TB']
]
const CPU_NUMS = [null, 2, 4, 6, 64, 2000]
const CONNECTION_NUMS = [null, 20, 1000, MAX_CONNECTIONS_VALUE]

const MEMORY_UNIT_IN_KB = { MB: 1024, GB: 1048576, TB: 1073741824 }

const allConfigurations = function* () {
  for (const dbVersion of DB_VERSIONS)
    for (const osType of OS_TYPES)
      for (const dbType of DB_TYPES)
        for (const hdType of HARD_DRIVE_TYPES)
          for (const dbSize of DB_SIZES)
            for (const [totalMemory, totalMemoryUnit] of MEMORY_SIZES)
              for (const cpuNum of CPU_NUMS)
                for (const connectionNum of CONNECTION_NUMS)
                  yield {
                    dbVersion,
                    osType,
                    dbType,
                    hdType,
                    dbSize,
                    totalMemory,
                    totalMemoryUnit,
                    cpuNum,
                    connectionNum
                  }
}

const isInRange = (value, min, max) => Number.isInteger(value) && value >= min && value <= max

const checkConfiguration = (configuration) => {
  const state = { configuration }
  const { dbVersion, osType, dbType, totalMemory, totalMemoryUnit, connectionNum } = configuration
  const errors = []
  const check = (condition, message) => {
    if (!condition) errors.push(message)
  }

  const totalMemoryKb = totalMemory * MEMORY_UNIT_IN_KB[totalMemoryUnit]
  const maxConnections = selectMaxConnections(state)
  const sharedBuffers = selectSharedBuffers(state)
  const effectiveCacheSize = selectEffectiveCacheSize(state)
  const maintenanceWorkMem = selectMaintenanceWorkMem(state)
  const autovacuumWorkMem = selectAutovacuumWorkMem(state)
  const workMem = selectWorkMem(state)
  const walBuffers = selectWalBuffers(state)
  const parallelSettings = Object.fromEntries(
    selectParallelSettings(state).map((item) => [item.key, item.value])
  )
  const walSettings = Object.fromEntries(
    selectCheckpointSegments(state).map((item) => [item.key, item.value])
  )
  const walLevel = Object.fromEntries(selectWalLevel(state).map((item) => [item.key, item.value]))
  const effectiveIoConcurrency = selectEffectiveIoConcurrency(state)
  const maintenanceIoConcurrency = selectMaintenanceIoConcurrency(state)
  const ioMethod = selectIoMethod(state)
  const ioWorkers = selectIoWorkers(state)
  const warnings = selectWarningInfoMessages(state)

  const memoryLimit =
    osType === OS_WINDOWS && dbVersion <= 17 ? MAX_KILOBYTES_WINDOWS : MAX_KILOBYTES

  // connections
  check(isInRange(maxConnections, 20, MAX_BACKENDS), `max_connections = ${maxConnections}`)
  if (!connectionNum) {
    check(maxConnections >= 100, `assumed max_connections = ${maxConnections} below default`)
  }

  // server processes must fit in MAX_BACKENDS
  const autovacuumSlots = dbVersion >= 18 ? 16 : (selectAutovacuumMaxWorkers(state) || 3) + 1
  const maxWorkerProcesses = parallelSettings['max_worker_processes'] || 8
  const maxWalSenders = walLevel['max_wal_senders'] === '0' ? 0 : 10
  const processes = maxConnections + autovacuumSlots + maxWorkerProcesses + maxWalSenders + 2
  check(processes <= MAX_BACKENDS, `${processes} server processes`)

  // memory settings are whole megabytes within PostgreSQL limits
  check(
    isInRange(sharedBuffers, 128, MAX_SHARED_BUFFERS) && sharedBuffers % 1024 === 0,
    `shared_buffers = ${sharedBuffers}kB`
  )
  check(
    isInRange(effectiveCacheSize, 8, MAX_EFFECTIVE_CACHE_SIZE) && effectiveCacheSize % 1024 === 0,
    `effective_cache_size = ${effectiveCacheSize}kB`
  )
  check(
    isInRange(workMem, MIN_WORK_MEM, memoryLimit) && workMem % 1024 === 0,
    `work_mem = ${workMem}kB`
  )
  check(
    isInRange(maintenanceWorkMem, 1024, memoryLimit) && maintenanceWorkMem % 1024 === 0,
    `maintenance_work_mem = ${maintenanceWorkMem}kB`
  )
  check(
    autovacuumWorkMem === null ||
      (isInRange(autovacuumWorkMem, 1024, memoryLimit) && autovacuumWorkMem < maintenanceWorkMem),
    `autovacuum_work_mem = ${autovacuumWorkMem}kB`
  )
  check(isInRange(walBuffers, 64, 16384) && walBuffers % 8 === 0, `wal_buffers = ${walBuffers}kB`)
  check(
    walSettings['min_wal_size'] >= 32768 &&
      walSettings['max_wal_size'] >= walSettings['min_wal_size'],
    `min_wal_size = ${walSettings['min_wal_size']}kB, max_wal_size = ${walSettings['max_wal_size']}kB`
  )

  // work_mem stays in memory budget (+30% when database fits in RAM), or user is warned
  const parallelWorkers = parallelSettings['max_parallel_workers'] || 8
  const workMemBudget = (totalMemoryKb - sharedBuffers) * 1.3
  const workMemUsage = (maxConnections + parallelWorkers) * workMem * 3
  const hasWorkMemWarning = warnings.some((line) => line.startsWith('max_connections = '))
  check(
    workMemUsage <= workMemBudget || hasWorkMemWarning,
    `work_mem = ${workMem}kB does not fit in memory without warning`
  )

  // parallel workers
  if (Object.keys(parallelSettings).length > 0) {
    check(
      isInRange(parallelSettings['max_worker_processes'], 8, MAX_BACKENDS),
      `max_worker_processes = ${parallelSettings['max_worker_processes']}`
    )
    check(
      isInRange(
        parallelSettings['max_parallel_workers'],
        1,
        Math.min(MAX_PARALLEL_WORKER_LIMIT, parallelSettings['max_worker_processes'])
      ),
      `max_parallel_workers = ${parallelSettings['max_parallel_workers']}`
    )
    check(
      isInRange(
        parallelSettings['max_parallel_workers_per_gather'],
        1,
        parallelSettings['max_parallel_workers']
      ),
      `max_parallel_workers_per_gather = ${parallelSettings['max_parallel_workers_per_gather']}`
    )
    if (dbVersion >= 11) {
      check(
        isInRange(
          parallelSettings['max_parallel_maintenance_workers'],
          1,
          MAX_PARALLEL_WORKER_LIMIT
        ),
        `max_parallel_maintenance_workers = ${parallelSettings['max_parallel_maintenance_workers']}`
      )
    }
  }

  // I/O settings
  check(
    effectiveIoConcurrency === null || isInRange(effectiveIoConcurrency, 1, 1000),
    `effective_io_concurrency = ${effectiveIoConcurrency}`
  )
  if (osType !== OS_LINUX && dbVersion < 18) {
    check(effectiveIoConcurrency === null, 'effective_io_concurrency without posix_fadvise')
  }
  check(
    maintenanceIoConcurrency === null ||
      (dbVersion >= 13 && isInRange(maintenanceIoConcurrency, 1, 1000)),
    `maintenance_io_concurrency = ${maintenanceIoConcurrency}`
  )
  check(
    ioMethod === null || (dbVersion >= 18 && ioMethod === 'io_uring'),
    `io_method = ${ioMethod}`
  )
  ioWorkers.forEach((item) => {
    const expectedKey = dbVersion >= 19 ? 'io_max_workers' : 'io_workers'
    check(
      dbVersion >= 18 &&
        ioMethod !== 'io_uring' &&
        item.key === expectedKey &&
        isInRange(item.value, 1, MAX_IO_WORKERS),
      `${item.key} = ${item.value}`
    )
  })

  // settings equal to PostgreSQL defaults are omitted
  check(
    selectCheckpointCompletionTarget(state) === null || dbVersion < 14,
    'checkpoint_completion_target equals default'
  )
  check(selectDefaultStatisticsTarget(state) !== 100, 'default_statistics_target equals default')
  check(selectJit(state) === null || dbVersion < 19, 'jit equals default')
  check(
    selectWalCompression(state) !== 'lz4' || (dbVersion >= 15 && dbVersion < 19),
    'wal_compression = lz4'
  )

  // desktop type keeps replication settings consistent
  if (dbType === DB_TYPE_DESKTOP) {
    check(
      walLevel['wal_level'] === 'minimal' && walLevel['max_wal_senders'] === '0',
      'wal_level = minimal requires max_wal_senders = 0'
    )
  }

  return errors
}

describe('configuration invariants', () => {
  it('generates valid and safe settings for all input combinations', () => {
    const failures = []
    let count = 0

    for (const configuration of allConfigurations()) {
      count += 1
      const errors = checkConfiguration(configuration)
      if (errors.length > 0 && failures.length < 20) {
        failures.push(`${JSON.stringify(configuration)}: ${errors.join(', ')}`)
      }
    }

    expect(count).toBeGreaterThan(0)
    expect(failures).toEqual([])
  })
})
