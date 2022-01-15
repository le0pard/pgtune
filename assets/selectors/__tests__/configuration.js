import {
  isReadyForConfiguration,
  maxConnections,
  defaultStatisticsTarget,
  randomPageCost,
  effectiveIoConcurrency,
  parallelSettings
} from '../configuration'

describe('isReadyForConfiguration', () => {
  it('nothing set', () => {
    expect(isReadyForConfiguration({
      configuration: {}
    })).toEqual(false)
  })
  it('set totalMemory', () => {
    expect(isReadyForConfiguration({
      configuration: {
        totalMemory: 100
      }
    })).toEqual(true)
  })
})

describe('maxConnections', () => {
  it('web app', () => {
    expect(maxConnections({
      configuration: {
        dbType: 'web'
      }
    })).toEqual(200)
  })
  it('oltp app', () => {
    expect(maxConnections({
      configuration: {
        dbType: 'oltp'
      }
    })).toEqual(300)
  })
  it('dw app', () => {
    expect(maxConnections({
      configuration: {
        dbType: 'dw'
      }
    })).toEqual(40)
  })
  it('desktop app', () => {
    expect(maxConnections({
      configuration: {
        dbType: 'desktop'
      }
    })).toEqual(20)
  })
  it('mixed app', () => {
    expect(maxConnections({
      configuration: {
        dbType: 'mixed'
      }
    })).toEqual(100)
  })
})

describe('defaultStatisticsTarget', () => {
  it('web app', () => {
    expect(defaultStatisticsTarget({
      configuration: {
        dbType: 'web'
      }
    })).toEqual(100)
  })
  it('oltp app', () => {
    expect(defaultStatisticsTarget({
      configuration: {
        dbType: 'oltp'
      }
    })).toEqual(100)
  })
  it('dw app', () => {
    expect(defaultStatisticsTarget({
      configuration: {
        dbType: 'dw'
      }
    })).toEqual(500)
  })
  it('desktop app', () => {
    expect(defaultStatisticsTarget({
      configuration: {
        dbType: 'desktop'
      }
    })).toEqual(100)
  })
  it('mixed app', () => {
    expect(defaultStatisticsTarget({
      configuration: {
        dbType: 'mixed'
      }
    })).toEqual(100)
  })
})

describe('randomPageCost', () => {
  it('hdd', () => {
    expect(randomPageCost({
      configuration: {
        hdType: 'hdd'
      }
    })).toEqual(4)
  })
  it('ssd', () => {
    expect(randomPageCost({
      configuration: {
        hdType: 'ssd'
      }
    })).toEqual(1.1)
  })
  it('san', () => {
    expect(randomPageCost({
      configuration: {
        hdType: 'san'
      }
    })).toEqual(1.1)
  })
})

describe('effectiveIoConcurrency', () => {
  it('hdd', () => {
    expect(effectiveIoConcurrency({
      configuration: {
        osType: 'linux',
        hdType: 'hdd'
      }
    })).toEqual(2)
  })
  it('ssd', () => {
    expect(effectiveIoConcurrency({
      configuration: {
        osType: 'linux',
        hdType: 'ssd'
      }
    })).toEqual(200)
  })
  it('san', () => {
    expect(effectiveIoConcurrency({
      configuration: {
        osType: 'linux',
        hdType: 'san'
      }
    })).toEqual(300)
  })
  it('ssd and windows', () => {
    expect(effectiveIoConcurrency({
      configuration: {
        osType: 'windows',
        hdType: 'ssd'
      }
    })).toEqual(null)
  })
})

describe('parallelSettings', () => {
  it('less 2 cpu provided', () => {
    expect(parallelSettings({
      configuration: {
        dbVersion: 9.6,
        cpuNum: 1
      }
    })).toEqual([])
  })
  it('postgresql 9.5', () => {
    expect(parallelSettings({
      configuration: {
        dbVersion: 9.5,
        cpuNum: 12
      }
    })).toEqual([
      {key: 'max_worker_processes', value: 12}
    ])
  })
  it('postgresql 9.6', () => {
    expect(parallelSettings({
      configuration: {
        dbVersion: 9.6,
        cpuNum: 12
      }
    })).toEqual([
      {key: 'max_worker_processes', value: 12},
      {key: 'max_parallel_workers_per_gather', value: 4}
    ])
  })
  it('postgresql 10', () => {
    expect(parallelSettings({
      configuration: {
        dbVersion: 10,
        cpuNum: 12
      }
    })).toEqual([
      {key: 'max_worker_processes', value: 12},
      {key: 'max_parallel_workers_per_gather', value: 4},
      {key: 'max_parallel_workers', value: 12}
    ])
  })

  it('postgresql 10 with 31 cpu', () => {
    expect(parallelSettings({
      configuration: {
        dbVersion: 10,
        cpuNum: 31
      }
    })).toEqual([
      {key: 'max_worker_processes', value: 31},
      {key: 'max_parallel_workers_per_gather', value: 4},
      {key: 'max_parallel_workers', value: 31}
    ])
  })

  it('postgresql 12 with 31 cpu and DWH', () => {
    expect(parallelSettings({
      configuration: {
        dbVersion: 12,
        cpuNum: 31,
        dbType: 'dw'
      }
    })).toEqual([
      {key: 'max_worker_processes', value: 31},
      {key: 'max_parallel_workers_per_gather', value: 16},
      {key: 'max_parallel_workers', value: 31},
      {key: 'max_parallel_maintenance_workers', value: 4}
    ])
  })
})
