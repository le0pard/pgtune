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
  selectWorkMem
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
