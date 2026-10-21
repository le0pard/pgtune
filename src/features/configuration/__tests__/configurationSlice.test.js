import {
  selectIsConfigured,
  selectMaxConnections,
  selectSharedBuffers,
  selectEffectiveCacheSize,
  selectCheckpointCompletionTarget,
  selectWalBuffers,
  selectDefaultStatisticsTarget,
  selectRandomPageCost,
  selectEffectiveIoConcurrency,
  selectMaintenanceIoConcurrency,
  selectParallelSettings,
  selectWalLevel,
  selectMaintenanceWorkMem,
  selectWorkMem,
  selectJit,
  selectWalCompression,
  selectAutovacuumMaxWorkers,
  selectAutovacuumWorkMem,
  selectIoWorkers,
  selectIoMethod,
  selectRestartRequiredSettings,
  selectWarningInfoMessages,
  normalizeConfiguration
} from '../configurationSlice'

describe('selectIsConfigured', () => {
  it('nothing set', () => {
    expect(
      selectIsConfigured({
        configuration: {}
      })
    ).toEqual(false)
  })
  it('set totalMemory', () => {
    expect(
      selectIsConfigured({
        configuration: {
          totalMemory: 100
        }
      })
    ).toEqual(true)
  })
})

describe('selectMaxConnections', () => {
  it('web app', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'web',
          totalMemory: 16,
          totalMemoryUnit: 'GB'
        }
      })
    ).toEqual(200)
  })
  it('oltp app', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'oltp',
          totalMemory: 16,
          totalMemoryUnit: 'GB'
        }
      })
    ).toEqual(300)
  })
  it('dw app does not go below PostgreSQL default', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'dw',
          totalMemory: 16,
          totalMemoryUnit: 'GB'
        }
      })
    ).toEqual(100)
  })
  it('desktop app does not go below PostgreSQL default', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'desktop',
          totalMemory: 16,
          totalMemoryUnit: 'GB'
        }
      })
    ).toEqual(100)
  })
  it('mixed app', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'mixed',
          totalMemory: 16,
          totalMemoryUnit: 'GB'
        }
      })
    ).toEqual(100)
  })
  it('lowers default for small memory to fit minimal work_mem', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'web',
          totalMemory: 2,
          totalMemoryUnit: 'GB'
        }
      })
    ).toEqual(120) // (2GB - 512MB) / (4MB * 3) - 8 workers
  })
  it('never lowers default below PostgreSQL default', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'web',
          totalMemory: 1,
          totalMemoryUnit: 'GB'
        }
      })
    ).toEqual(100)
  })
  it('uses provided number of connections', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'web',
          totalMemory: 1,
          totalMemoryUnit: 'GB',
          connectionNum: 500
        }
      })
    ).toEqual(500)
  })
})

describe('selectSharedBuffers', () => {
  it('rounds down to whole megabytes', () => {
    expect(
      selectSharedBuffers({
        configuration: {
          dbType: 'web',
          totalMemory: 1001,
          totalMemoryUnit: 'MB'
        }
      })
    ).toEqual(256000) // 250MB in kB
  })
})

describe('selectEffectiveCacheSize', () => {
  it('rounds down to whole megabytes', () => {
    expect(
      selectEffectiveCacheSize({
        configuration: {
          dbType: 'web',
          totalMemory: 1001,
          totalMemoryUnit: 'MB'
        }
      })
    ).toEqual(768000) // 750MB in kB
  })
})

describe('selectCheckpointCompletionTarget', () => {
  it('sets 0.9 before PostgreSQL 14', () => {
    expect(selectCheckpointCompletionTarget({ configuration: { dbVersion: 13 } })).toEqual(0.9)
  })
  it('omits it on PostgreSQL 14+, where 0.9 is default', () => {
    expect(selectCheckpointCompletionTarget({ configuration: { dbVersion: 14 } })).toEqual(null)
  })
})

describe('selectWalBuffers', () => {
  it('uses 1/32 of shared_buffers like PostgreSQL automatic value', () => {
    expect(
      selectWalBuffers({
        configuration: {
          dbType: 'web',
          totalMemory: 512,
          totalMemoryUnit: 'MB'
        }
      })
    ).toEqual(4096) // shared_buffers 128MB / 32
    expect(
      selectWalBuffers({
        configuration: {
          dbType: 'web',
          totalMemory: 1000,
          totalMemoryUnit: 'MB'
        }
      })
    ).toEqual(8000) // shared_buffers 250MB / 32
  })
  it('caps at one WAL segment (16MB)', () => {
    expect(
      selectWalBuffers({
        configuration: {
          dbType: 'web',
          totalMemory: 16,
          totalMemoryUnit: 'GB'
        }
      })
    ).toEqual(16384)
  })
})

describe('selectDefaultStatisticsTarget', () => {
  it('web app', () => {
    expect(
      selectDefaultStatisticsTarget({
        configuration: {
          dbType: 'web'
        }
      })
    ).toEqual(null)
  })
  it('oltp app', () => {
    expect(
      selectDefaultStatisticsTarget({
        configuration: {
          dbType: 'oltp'
        }
      })
    ).toEqual(null)
  })
  it('dw app', () => {
    expect(
      selectDefaultStatisticsTarget({
        configuration: {
          dbType: 'dw'
        }
      })
    ).toEqual(500)
  })
  it('desktop app', () => {
    expect(
      selectDefaultStatisticsTarget({
        configuration: {
          dbType: 'desktop'
        }
      })
    ).toEqual(null)
  })
  it('mixed app', () => {
    expect(
      selectDefaultStatisticsTarget({
        configuration: {
          dbType: 'mixed'
        }
      })
    ).toEqual(null)
  })
})

describe('selectRandomPageCost', () => {
  it('hdd', () => {
    expect(
      selectRandomPageCost({
        configuration: {
          hdType: 'hdd'
        }
      })
    ).toEqual(4)
  })
  it('ssd', () => {
    expect(
      selectRandomPageCost({
        configuration: {
          hdType: 'ssd'
        }
      })
    ).toEqual(1.1)
  })
  it('san', () => {
    expect(
      selectRandomPageCost({
        configuration: {
          hdType: 'san'
        }
      })
    ).toEqual(1.1)
  })
  it('nvme', () => {
    expect(
      selectRandomPageCost({
        configuration: {
          hdType: 'nvme'
        }
      })
    ).toEqual(1.1)
  })
  it('forces 1.1 for HDD when database fits entirely in RAM', () => {
    expect(
      selectRandomPageCost({
        configuration: {
          hdType: 'hdd',
          dbSize: 'less_ram'
        }
      })
    ).toEqual(1.1)
  })
  it('returns 4 for Data Warehouses on SSD to prevent bad index scans', () => {
    expect(
      selectRandomPageCost({
        configuration: {
          hdType: 'ssd',
          dbType: 'dw',
          dbSize: 'mid_ram'
        }
      })
    ).toEqual(4)
  })
  it('returns 1.1 for Data Warehouses if the DB fits entirely in RAM', () => {
    expect(
      selectRandomPageCost({
        configuration: {
          hdType: 'ssd',
          dbType: 'dw',
          dbSize: 'less_ram'
        }
      })
    ).toEqual(1.1)
  })
})

describe('selectEffectiveIoConcurrency', () => {
  it('hdd', () => {
    expect(
      selectEffectiveIoConcurrency({
        configuration: {
          osType: 'linux',
          hdType: 'hdd'
        }
      })
    ).toEqual(2)
  })
  it('ssd', () => {
    expect(
      selectEffectiveIoConcurrency({
        configuration: {
          osType: 'linux',
          hdType: 'ssd'
        }
      })
    ).toEqual(200)
  })
  it('san', () => {
    expect(
      selectEffectiveIoConcurrency({
        configuration: {
          osType: 'linux',
          hdType: 'san'
        }
      })
    ).toEqual(300)
  })
  it('ssd and windows', () => {
    expect(
      selectEffectiveIoConcurrency({
        configuration: {
          osType: 'windows',
          hdType: 'ssd',
          dbVersion: 17
        }
      })
    ).toEqual(null)
  })
  it('ssd and windows on PostgreSQL 18+', () => {
    expect(
      selectEffectiveIoConcurrency({
        configuration: {
          osType: 'windows',
          hdType: 'ssd',
          dbVersion: 18
        }
      })
    ).toEqual(200)
  })
  it('nvme and macOS on PostgreSQL 18+', () => {
    expect(
      selectEffectiveIoConcurrency({
        configuration: {
          osType: 'mac',
          hdType: 'nvme',
          dbVersion: 18
        }
      })
    ).toEqual(1000)
  })
  it('nvme', () => {
    expect(
      selectEffectiveIoConcurrency({
        configuration: {
          osType: 'linux',
          hdType: 'nvme'
        }
      })
    ).toEqual(1000)
  })
})

describe('selectMaintenanceIoConcurrency', () => {
  it('returns null before PostgreSQL 13', () => {
    expect(
      selectMaintenanceIoConcurrency({
        configuration: { osType: 'linux', hdType: 'ssd', dbVersion: 12 }
      })
    ).toEqual(null)
  })
  it('follows effective_io_concurrency on PostgreSQL 13+', () => {
    expect(
      selectMaintenanceIoConcurrency({
        configuration: { osType: 'linux', hdType: 'ssd', dbVersion: 13 }
      })
    ).toEqual(200)
    expect(
      selectMaintenanceIoConcurrency({
        configuration: { osType: 'linux', hdType: 'hdd', dbVersion: 17 }
      })
    ).toEqual(2)
  })
  it('returns null for macOS before PostgreSQL 18', () => {
    expect(
      selectMaintenanceIoConcurrency({
        configuration: { osType: 'mac', hdType: 'ssd', dbVersion: 17 }
      })
    ).toEqual(null)
    expect(
      selectMaintenanceIoConcurrency({
        configuration: { osType: 'mac', hdType: 'ssd', dbVersion: 18 }
      })
    ).toEqual(200)
  })
})

describe('selectParallelSettings', () => {
  it('less 2 cpu provided', () => {
    expect(
      selectParallelSettings({
        configuration: {
          dbVersion: 14,
          cpuNum: 1
        }
      })
    ).toEqual([])
  })
  it('postgresql 13', () => {
    expect(
      selectParallelSettings({
        configuration: {
          dbVersion: 13,
          cpuNum: 12
        }
      })
    ).toEqual([
      { key: 'max_worker_processes', value: 12 },
      { key: 'max_parallel_workers_per_gather', value: 4 },
      { key: 'max_parallel_workers', value: 12 },
      { key: 'max_parallel_maintenance_workers', value: 4 }
    ])
  })
  it('postgresql 10', () => {
    expect(
      selectParallelSettings({
        configuration: {
          dbVersion: 10,
          cpuNum: 12
        }
      })
    ).toEqual([
      { key: 'max_worker_processes', value: 12 },
      { key: 'max_parallel_workers_per_gather', value: 4 },
      { key: 'max_parallel_workers', value: 12 }
    ])
  })

  it('postgresql 10 with 31 cpu', () => {
    expect(
      selectParallelSettings({
        configuration: {
          dbVersion: 10,
          cpuNum: 31
        }
      })
    ).toEqual([
      { key: 'max_worker_processes', value: 31 },
      { key: 'max_parallel_workers_per_gather', value: 4 },
      { key: 'max_parallel_workers', value: 31 }
    ])
  })

  it('postgresql 12 with 31 cpu and DWH', () => {
    expect(
      selectParallelSettings({
        configuration: {
          dbVersion: 12,
          cpuNum: 31,
          dbType: 'dw'
        }
      })
    ).toEqual([
      { key: 'max_worker_processes', value: 31 },
      { key: 'max_parallel_workers_per_gather', value: 7 }, // 1/4 of max_parallel_workers
      { key: 'max_parallel_workers', value: 31 },
      { key: 'max_parallel_maintenance_workers', value: 4 }
    ])
  })

  it('DWH keeps at least 4 workers per gather', () => {
    expect(
      selectParallelSettings({
        configuration: {
          dbVersion: 13,
          cpuNum: 12,
          dbType: 'dw'
        }
      })
    ).toEqual([
      { key: 'max_worker_processes', value: 12 },
      { key: 'max_parallel_workers_per_gather', value: 4 },
      { key: 'max_parallel_workers', value: 12 },
      { key: 'max_parallel_maintenance_workers', value: 4 }
    ])
  })

  it('never lowers max_worker_processes below PostgreSQL default (8)', () => {
    expect(
      selectParallelSettings({
        configuration: {
          dbVersion: 13,
          cpuNum: 4
        }
      })
    ).toEqual([
      { key: 'max_worker_processes', value: 8 },
      { key: 'max_parallel_workers_per_gather', value: 2 },
      { key: 'max_parallel_workers', value: 4 },
      { key: 'max_parallel_maintenance_workers', value: 2 }
    ])
  })

  it('caps parallel workers at PostgreSQL limit (1024)', () => {
    expect(
      selectParallelSettings({
        configuration: {
          dbVersion: 13,
          cpuNum: 2000
        }
      })
    ).toEqual([
      { key: 'max_worker_processes', value: 1024 },
      { key: 'max_parallel_workers_per_gather', value: 4 },
      { key: 'max_parallel_workers', value: 1024 },
      { key: 'max_parallel_maintenance_workers', value: 4 }
    ])
  })
})

describe('selectWalLevel', () => {
  it('desktop app', () => {
    expect(
      selectWalLevel({
        configuration: {
          dbType: 'desktop'
        }
      })
    ).toEqual([
      { key: 'wal_level', value: 'minimal' },
      { key: 'max_wal_senders', value: '0' }
    ])
  })

  it('web app', () => {
    expect(
      selectWalLevel({
        configuration: {
          dbType: 'web'
        }
      })
    ).toEqual([])
  })
})

describe('selectMaintenanceWorkMem', () => {
  it('caps at 8GB for linux servers with extreme memory', () => {
    expect(
      selectMaintenanceWorkMem({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 17
        }
      })
    ).toEqual(8388608) // 8GB in kB
  })

  it('caps at 2GB minus 1MB for Windows servers on PostgreSQL 17 or older', () => {
    expect(
      selectMaintenanceWorkMem({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'windows',
          dbVersion: 17
        }
      })
    ).toEqual(2096128) // (2GB - 1MB) in kB
  })

  it('caps at 8GB for Windows servers on PostgreSQL 18 or newer', () => {
    expect(
      selectMaintenanceWorkMem({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'windows',
          dbVersion: 18
        }
      })
    ).toEqual(8388608) // 8GB in kB
  })

  it('calculates properly below the limit cap', () => {
    expect(
      selectMaintenanceWorkMem({
        configuration: {
          totalMemory: 16, // 16GB / 16 = 1GB
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15
        }
      })
    ).toEqual(1048576) // 1GB in kB
  })

  it('rounds down to whole megabytes', () => {
    expect(
      selectMaintenanceWorkMem({
        configuration: {
          totalMemory: 1000, // 1000MB / 16 = 62.5MB
          totalMemoryUnit: 'MB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15
        }
      })
    ).toEqual(63488) // 62MB in kB
  })
})

describe('selectWorkMem', () => {
  it('protects work_mem by flooring to 4MB during extreme max_connections', () => {
    expect(
      selectWorkMem({
        configuration: {
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15,
          connectionNum: 9999,
          cpuNum: 4
        }
      })
    ).toEqual(4096) // Floors to 4MB in kB
  })

  it('caps work_mem at 2GB minus 1MB for Windows servers on PostgreSQL 17 or older', () => {
    expect(
      selectWorkMem({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbType: 'web', // 'web' does not divide work_mem by 2 like dw does
          osType: 'windows',
          dbVersion: 17,
          connectionNum: 20, // 20 connections on 256GB RAM forces a huge work_mem (~2.6GB)
          cpuNum: 4
        }
      })
    ).toEqual(2096128) // Caps at (2GB - 1MB) in kB
  })

  it('allows work_mem to exceed 2GB for Windows servers on PostgreSQL 18 or newer', () => {
    expect(
      selectWorkMem({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'windows',
          dbVersion: 18,
          connectionNum: 20,
          cpuNum: 4
        }
      })
    ).toBeGreaterThan(2096128) // Actually evaluates to 2795520 (2730MB)
  })

  it('rounds down to whole megabytes', () => {
    expect(
      selectWorkMem({
        configuration: {
          totalMemory: 64,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15,
          dbSize: 'mid_ram'
        }
      })
    ).toEqual(79872) // 48GB / (208 * 3) = 78.77MB -> 78MB in kB
  })

  it('safely boosts work_mem by 30% when database size is less than RAM', () => {
    expect(
      selectWorkMem({
        configuration: {
          totalMemory: 64,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15,
          dbSize: 'less_ram'
        }
      })
    ).toEqual(104448) // 78.77MB * 1.3 = 102.4MB -> 102MB in kB
  })

  it('safely reduces work_mem by 10% when database size is > 3x RAM to protect OS cache', () => {
    expect(
      selectWorkMem({
        configuration: {
          totalMemory: 64,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15,
          dbSize: 'greater_ram'
        }
      })
    ).toEqual(71680) // 78.77MB * 0.9 = 70.9MB -> 70MB in kB
  })
})

describe('selectJit', () => {
  it('turns off JIT for web/oltp workloads on PG12+', () => {
    expect(selectJit({ configuration: { dbVersion: 12, dbType: 'web' } })).toEqual('off')
    expect(selectJit({ configuration: { dbVersion: 15, dbType: 'oltp' } })).toEqual('off')
  })

  it('leaves JIT alone for Data Warehouses (DW) or older PG versions', () => {
    expect(selectJit({ configuration: { dbVersion: 15, dbType: 'dw' } })).toEqual(null)
    expect(selectJit({ configuration: { dbVersion: 11, dbType: 'web' } })).toEqual(null)
  })

  it('leaves JIT alone on PG19+, where it is disabled by default', () => {
    expect(selectJit({ configuration: { dbVersion: 19, dbType: 'web' } })).toEqual(null)
  })
})

describe('selectWalCompression', () => {
  it('enables wal_compression safely using built-in pglz for PG10 through PG14', () => {
    expect(selectWalCompression({ configuration: { dbVersion: 10 } })).toEqual('on')
    expect(selectWalCompression({ configuration: { dbVersion: 14 } })).toEqual('on')
  })

  it('uses lz4 for PG15+ assuming standard package installations', () => {
    expect(selectWalCompression({ configuration: { dbVersion: 15 } })).toEqual('lz4')
    expect(selectWalCompression({ configuration: { dbVersion: 17 } })).toEqual('lz4')
  })

  it('uses on for PG19+, which picks the best available method', () => {
    expect(selectWalCompression({ configuration: { dbVersion: 19 } })).toEqual('on')
  })
})

describe('selectAutovacuumMaxWorkers', () => {
  it('scales autovacuum workers based on CPU count', () => {
    expect(selectAutovacuumMaxWorkers({ configuration: { cpuNum: 32 } })).toEqual(5)
    expect(selectAutovacuumMaxWorkers({ configuration: { cpuNum: 16 } })).toEqual(4)
    expect(selectAutovacuumMaxWorkers({ configuration: { cpuNum: 8 } })).toEqual(null) // relies on PG default (3)
  })
})

describe('selectAutovacuumWorkMem', () => {
  it('leaves autovacuum_work_mem alone if maintenance_work_mem is small', () => {
    expect(
      selectAutovacuumWorkMem({
        configuration: {
          totalMemory: 16, // maintenance_work_mem is exactly 1GB
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15
        }
      })
    ).toEqual(null)
  })

  it('caps autovacuum_work_mem at 1GB if maintenance_work_mem is massive', () => {
    expect(
      selectAutovacuumWorkMem({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15
        }
      })
    ).toEqual(1048576) // exactly 1GB
  })

  it('caps autovacuum_work_mem at 1GB for Windows PG17 or older', () => {
    expect(
      selectAutovacuumWorkMem({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'windows',
          dbVersion: 17 // maintenance_work_mem is capped at 2GB - 1MB
        }
      })
    ).toEqual(1048576) // exactly 1GB
  })

  it('caps autovacuum_work_mem at 1GB for Windows PG18+', () => {
    expect(
      selectAutovacuumWorkMem({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'windows',
          dbVersion: 18 // PG18 allows 8GB maintenance_work_mem
        }
      })
    ).toEqual(1048576) // exactly 1GB
  })
})

describe('selectIoWorkers', () => {
  it('returns nothing for PostgreSQL versions before 18', () => {
    expect(
      selectIoWorkers({ configuration: { dbVersion: 17, cpuNum: 32, osType: 'mac' } })
    ).toEqual([])
  })

  it('returns nothing if cpuNum is small or missing, deferring to the PG default of 3', () => {
    expect(selectIoWorkers({ configuration: { dbVersion: 18, osType: 'mac' } })).toEqual([])
    expect(selectIoWorkers({ configuration: { dbVersion: 18, cpuNum: 8, osType: 'mac' } })).toEqual(
      []
    ) // 8 / 4 = 2, so it stays default
  })

  it('scales to roughly 25% of CPU cores for large servers', () => {
    expect(
      selectIoWorkers({ configuration: { dbVersion: 18, cpuNum: 32, osType: 'mac' } })
    ).toEqual([{ key: 'io_workers', value: 8 }])
    expect(
      selectIoWorkers({ configuration: { dbVersion: 18, cpuNum: 64, osType: 'mac' } })
    ).toEqual([{ key: 'io_workers', value: 16 }])
  })

  it('strictly caps at 32 as per PostgreSQL maximum limits', () => {
    expect(
      selectIoWorkers({ configuration: { dbVersion: 18, cpuNum: 256, osType: 'mac' } })
    ).toEqual([{ key: 'io_workers', value: 32 }])
  })

  it('on linux for io_uring return nothing', () => {
    expect(
      selectIoWorkers({ configuration: { dbVersion: 18, cpuNum: 256, osType: 'linux' } })
    ).toEqual([])
  })

  it('uses io_max_workers on PostgreSQL 19+, only above its default of 8', () => {
    expect(
      selectIoWorkers({ configuration: { dbVersion: 19, cpuNum: 32, osType: 'mac' } })
    ).toEqual([])
    expect(
      selectIoWorkers({ configuration: { dbVersion: 19, cpuNum: 64, osType: 'mac' } })
    ).toEqual([{ key: 'io_max_workers', value: 16 }])
  })
})

describe('selectIoMethod', () => {
  it('returns null for PostgreSQL versions before 18', () => {
    expect(selectIoMethod({ configuration: { dbVersion: 17, osType: 'linux' } })).toEqual(null)
  })

  it('returns io_uring for Linux on PostgreSQL 18+, assuming --with-liburing is present', () => {
    expect(selectIoMethod({ configuration: { dbVersion: 18, osType: 'linux' } })).toEqual(
      'io_uring'
    )
  })

  it('keeps default worker for Windows on PostgreSQL 18+', () => {
    expect(selectIoMethod({ configuration: { dbVersion: 18, osType: 'windows' } })).toEqual(null)
  })

  it('keeps default worker for macOS on PostgreSQL 18+', () => {
    expect(selectIoMethod({ configuration: { dbVersion: 18, osType: 'mac' } })).toEqual(null)
  })
})

describe('selectRestartRequiredSettings', () => {
  it('includes autovacuum_max_workers before PostgreSQL 18', () => {
    expect(selectRestartRequiredSettings({ configuration: { dbVersion: 17 } })).toContain(
      'autovacuum_max_workers'
    )
  })

  it('excludes autovacuum_max_workers on PostgreSQL 18+', () => {
    const settings = selectRestartRequiredSettings({ configuration: { dbVersion: 18 } })
    expect(settings).toContain('shared_buffers')
    expect(settings).not.toContain('autovacuum_max_workers')
  })
})

describe('selectWarningInfoMessages', () => {
  it('returns no warnings for standard configurations', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbVersion: 14,
          osType: 'linux',
          dbType: 'web'
        }
      })
    ).toEqual([])
  })

  it('returns warning for low memory systems', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 512,
          totalMemoryUnit: 'MB',
          dbVersion: 14,
          osType: 'linux',
          dbType: 'web'
        }
      })
    ).toEqual([
      {
        level: 'note',
        text: ['This tool is not optimal for low memory systems']
      },
      {
        level: 'memory',
        text: [
          'max_connections = 100 is too high for this amount of RAM:',
          'work_mem is raised to the 4MB minimum, so under load',
          'PostgreSQL can run out of memory. Lower max_connections',
          'or use a connection pooler (e.g. PgBouncer)'
        ]
      }
    ])
  })

  it('returns warning for very high memory systems', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbVersion: 14,
          osType: 'linux',
          dbType: 'web'
        }
      })
    ).toEqual([
      {
        level: 'note',
        text: ['This tool is not optimal for very high memory systems']
      },
      {
        level: 'note',
        text: [
          'shared_buffers is large: reserve Linux huge pages',
          '(vm.nr_hugepages) to reduce memory used by page tables',
          'of each connection. See "Linux Huge Pages" in PostgreSQL',
          'documentation to calculate the number of huge pages'
        ]
      }
    ])
  })

  it('returns warning when work_mem minimum does not fit in memory', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbVersion: 14,
          osType: 'linux',
          dbType: 'web',
          connectionNum: 2000
        }
      })
    ).toEqual([
      {
        level: 'memory',
        text: [
          'max_connections = 2000 is too high for this amount of RAM:',
          'work_mem is raised to the 4MB minimum, so under load',
          'PostgreSQL can run out of memory. Lower max_connections',
          'or use a connection pooler (e.g. PgBouncer)'
        ]
      }
    ])
  })

  it('returns huge pages warning with calculation command on PostgreSQL 15+', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 16,
          totalMemoryUnit: 'GB',
          dbVersion: 15,
          osType: 'linux',
          dbType: 'web'
        }
      })
    ).toContainEqual({
      level: 'note',
      text: [
        'shared_buffers is large: reserve Linux huge pages',
        '(vm.nr_hugepages) to reduce memory used by page tables',
        'of each connection. Required number of huge pages',
        '(with these settings, while the server is stopped):'
      ],
      code: 'postgres -D $PGDATA -C shared_memory_size_in_huge_pages'
    })
  })

  it('returns huge pages warning for Windows', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 16,
          totalMemoryUnit: 'GB',
          dbVersion: 14,
          osType: 'windows',
          dbType: 'web'
        }
      })
    ).toEqual([
      {
        level: 'note',
        text: [
          'shared_buffers is large: grant the "Lock pages in memory"',
          'right to the PostgreSQL service account to use huge pages'
        ]
      }
    ])
  })

  it('returns no huge pages warning for macOS', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 64,
          totalMemoryUnit: 'GB',
          dbVersion: 14,
          osType: 'mac',
          dbType: 'web'
        }
      })
    ).toEqual([])
  })

  it('returns startup warning for minimal wal_level on desktop', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 2,
          totalMemoryUnit: 'GB',
          dbVersion: 14,
          osType: 'linux',
          dbType: 'desktop'
        }
      })
    ).toEqual([
      {
        level: 'startup',
        text: [
          'wal_level = minimal: PostgreSQL will not start if',
          'archive_mode = on or if replication slots exist.',
          'Replication, pg_basebackup and point-in-time recovery',
          'are not possible'
        ]
      }
    ])
  })

  it('returns startup warning for lz4 wal_compression', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbVersion: 15,
          osType: 'linux',
          dbType: 'web'
        }
      })
    ).toEqual([
      {
        level: 'startup',
        text: [
          'wal_compression = lz4 requires PostgreSQL compiled',
          'with --with-lz4. Check build support:'
        ],
        code: "SELECT enumvals FROM pg_settings WHERE name = 'wal_compression';"
      }
    ])
  })

  it('returns startup warning for io_uring io_method', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbVersion: 18,
          osType: 'linux',
          dbType: 'web'
        }
      })
    ).toEqual([
      {
        level: 'startup',
        text: [
          'wal_compression = lz4 requires PostgreSQL compiled',
          'with --with-lz4. Check build support:'
        ],
        code: "SELECT enumvals FROM pg_settings WHERE name = 'wal_compression';"
      },
      {
        level: 'startup',
        text: [
          'io_method = io_uring requires PostgreSQL compiled',
          'with --with-liburing, and io_uring allowed by the kernel',
          '(kernel.io_uring_disabled sysctl) and by containers',
          '(Docker default seccomp profile blocks it). Check build support:'
        ],
        code: "SELECT enumvals FROM pg_settings WHERE name = 'io_method';"
      }
    ])
  })

  it('returns no lz4 warning on PostgreSQL 19+', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbVersion: 19,
          osType: 'mac',
          dbType: 'web'
        }
      })
    ).toEqual([])
  })

  it('returns warning for Data Warehouses on NVMe to explain default cost parameters', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 64,
          totalMemoryUnit: 'GB',
          dbVersion: 14,
          osType: 'mac',
          dbType: 'dw',
          hdType: 'nvme',
          dbSize: 'mid_ram'
        }
      })
    ).toEqual([
      {
        level: 'note',
        text: [
          'Cost parameters for Data Warehouses on NVMe drives',
          'are left at defaults to avoid catastrophic index scan',
          'selections. Monitor query planner behavior and adjust',
          'random_page_cost if necessary'
        ]
      }
    ])
  })
})

describe('normalizeConfiguration', () => {
  it('converts form values to configuration state', () => {
    expect(
      normalizeConfiguration({
        dbVersion: '18',
        osType: 'linux',
        dbType: 'web',
        totalMemory: '16',
        totalMemoryUnit: 'GB',
        cpuNum: '',
        connectionNum: '300',
        hdType: 'ssd',
        dbSize: 'mid_ram'
      })
    ).toEqual({
      dbVersion: 18,
      osType: 'linux',
      dbType: 'web',
      totalMemory: 16,
      totalMemoryUnit: 'GB',
      cpuNum: null,
      connectionNum: 300,
      hdType: 'ssd',
      dbSize: 'mid_ram'
    })
  })
})
