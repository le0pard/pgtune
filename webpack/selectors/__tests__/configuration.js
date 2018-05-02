import {
  isReadyForConfiguration,
  maxConnections
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
    })).toEqual(20)
  })
})
