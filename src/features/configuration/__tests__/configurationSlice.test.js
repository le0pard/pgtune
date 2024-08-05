import {
  selectIsConfigured,
  selectMaxConnections,
  selectDefaultStatisticsTarget,
  selectRandomPageCost,
  selectEffectiveIoConcurrency,
  selectParallelSettings,
  selectWalLevel
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
