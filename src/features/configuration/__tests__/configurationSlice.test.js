import {
  selectIsConfigured,
  selectMaxConnections,
  selectDefaultStatisticsTarget,
  selectRandomPageCost,
  selectEffectiveIoConcurrency,
  selectParallelSettings,
  selectWalLevel,
  selectHugePages,
  selectMaintenanceWorkMem,
  selectWorkMem,
  selectJit,
  selectWalCompression,
  selectAutovacuumMaxWorkers,
  selectAutovacuumWorkMem,
  selectIoWorkers,
  selectIoMethod,
  selectWarningInfoMessages
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
          dbType: 'web'
        }
      })
    ).toEqual(200)
  })
  it('oltp app', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'oltp'
        }
      })
    ).toEqual(300)
  })
  it('dw app', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'dw'
        }
      })
    ).toEqual(40)
  })
  it('desktop app', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'desktop'
        }
      })
    ).toEqual(20)
  })
  it('mixed app', () => {
    expect(
      selectMaxConnections({
        configuration: {
          dbType: 'mixed'
        }
      })
    ).toEqual(100)
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
    ).toEqual(100)
  })
  it('oltp app', () => {
    expect(
      selectDefaultStatisticsTarget({
        configuration: {
          dbType: 'oltp'
        }
      })
    ).toEqual(100)
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
    ).toEqual(100)
  })
  it('mixed app', () => {
    expect(
      selectDefaultStatisticsTarget({
        configuration: {
          dbType: 'mixed'
        }
      })
    ).toEqual(100)
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
          hdType: 'ssd'
        }
      })
    ).toEqual(null)
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
      { key: 'max_parallel_workers_per_gather', value: 16 },
      { key: 'max_parallel_workers', value: 31 },
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
})

describe('selectHugePages', () => {
  it('returns off when shared_buffers is small (< 2GB)', () => {
    expect(
      selectHugePages({
        configuration: {
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15
        }
      })
    ).toEqual('off')
  })

  it('returns try when shared_buffers is large (>= 2GB)', () => {
    expect(
      selectHugePages({
        configuration: {
          totalMemory: 16,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15
        }
      })
    ).toEqual('try')
  })

  it('returns off for macOS regardless of RAM size', () => {
    expect(
      selectHugePages({
        configuration: {
          totalMemory: 128,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'mac',
          dbVersion: 15
        }
      })
    ).toEqual('off')
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
    ).toBeGreaterThan(2096128) // Actually evaluates to 2796202 (~2.6GB)
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
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'linux',
          dbVersion: 15
        }
      })
    ).toEqual(null)
  })

  it('caps autovacuum_work_mem at 2GB if maintenance_work_mem is massive', () => {
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
    ).toEqual(2097152) // exactly 2GB
  })

  it('returns null for Windows PG17 or older because maintenance_work_mem is already safely capped below the threshold', () => {
    expect(
      selectAutovacuumWorkMem({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbType: 'web',
          osType: 'windows',
          dbVersion: 17
        }
      })
    ).toEqual(null) // Falls back to safely capped maintenance_work_mem
  })

  it('caps autovacuum_work_mem at 2GB for Windows PG18+ where maintenance_work_mem is allowed to be massive', () => {
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
    ).toEqual(2097152) // exactly 2GB
  })
})

describe('selectIoWorkers', () => {
  it('returns null for PostgreSQL versions before 18', () => {
    expect(selectIoWorkers({ configuration: { dbVersion: 17, cpuNum: 32 } })).toEqual(null)
  })

  it('returns null if cpuNum is small or missing, deferring to the PG default of 3', () => {
    expect(selectIoWorkers({ configuration: { dbVersion: 18 } })).toEqual(null)
    expect(selectIoWorkers({ configuration: { dbVersion: 18, cpuNum: 8 } })).toEqual(null) // 8 / 4 = 2, so it stays null
  })

  it('scales to roughly 25% of CPU cores for large servers', () => {
    expect(selectIoWorkers({ configuration: { dbVersion: 18, cpuNum: 32 } })).toEqual(8)
    expect(selectIoWorkers({ configuration: { dbVersion: 18, cpuNum: 64 } })).toEqual(16)
  })

  it('strictly caps at 32 as per PostgreSQL maximum limits', () => {
    expect(selectIoWorkers({ configuration: { dbVersion: 18, cpuNum: 256 } })).toEqual(32)
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

  it('safely falls back to worker for Windows on PostgreSQL 18+', () => {
    expect(selectIoMethod({ configuration: { dbVersion: 18, osType: 'windows' } })).toEqual(
      'worker'
    )
  })

  it('safely falls back to worker for macOS on PostgreSQL 18+', () => {
    expect(selectIoMethod({ configuration: { dbVersion: 18, osType: 'mac' } })).toEqual('worker')
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
          osType: 'linux'
        }
      })
    ).toEqual([])
  })

  it('returns warning for low memory systems', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 128,
          totalMemoryUnit: 'MB',
          dbVersion: 14,
          osType: 'linux'
        }
      })
    ).toEqual(['WARNING', 'this tool not being optimal', 'for low memory systems'])
  })

  it('returns warning for very high memory systems', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 256,
          totalMemoryUnit: 'GB',
          dbVersion: 14,
          osType: 'linux'
        }
      })
    ).toEqual(['WARNING', 'this tool not being optimal', 'for very high memory systems'])
  })

  it('returns compilation warning for lz4 wal_compression', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbVersion: 15,
          osType: 'linux'
        }
      })
    ).toEqual([
      'WARNING',
      'wal_compression = lz4 requires PostgreSQL',
      'to be compiled with --with-lz4'
    ])
  })

  it('returns compilation warning for io_uring io_method', () => {
    expect(
      selectWarningInfoMessages({
        configuration: {
          totalMemory: 4,
          totalMemoryUnit: 'GB',
          dbVersion: 18,
          osType: 'linux'
        }
      })
    ).toEqual([
      'WARNING',
      'wal_compression = lz4 requires PostgreSQL',
      'to be compiled with --with-lz4',
      'io_method = io_uring requires PostgreSQL',
      'to be compiled with --with-liburing'
    ])
  })
})
