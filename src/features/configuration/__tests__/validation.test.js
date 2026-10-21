import { isValid, validateValues } from '../validation'

const VALID_VALUES = {
  dbVersion: 18,
  osType: 'linux',
  dbType: 'web',
  cpuNum: '',
  totalMemory: '16',
  totalMemoryUnit: 'GB',
  connectionNum: '',
  hdType: 'ssd',
  dbSize: 'mid_ram'
}

describe('isValid', () => {
  it('accepts valid values with empty optional fields', () => {
    expect(isValid(VALID_VALUES)).toEqual(true)
  })

  it('accepts digits in numeric fields', () => {
    expect(isValid({ ...VALID_VALUES, cpuNum: '8', connectionNum: '300' })).toEqual(true)
    // surrounding spaces are ignored, like by parseInt
    expect(isValid({ ...VALID_VALUES, totalMemory: ' 16 ' })).toEqual(true)
  })

  it('rejects numbers, which are not plain digits', () => {
    ;['1e3', '16GB', '1.5', '-4', '+5', '0x10', 'abc', ' '].forEach((value) => {
      expect(isValid({ ...VALID_VALUES, totalMemory: value })).toEqual(false)
      expect(isValid({ ...VALID_VALUES, cpuNum: value })).toEqual(false)
      expect(isValid({ ...VALID_VALUES, connectionNum: value })).toEqual(false)
    })
  })

  it('requires total memory', () => {
    expect(isValid({ ...VALID_VALUES, totalMemory: '' })).toEqual(false)
  })

  it('accepts missing optional url params, but not missing required ones', () => {
    const { cpuNum: _cpuNum, connectionNum: _connectionNum, ...withoutOptional } = VALID_VALUES
    expect(isValid(withoutOptional)).toEqual(true)
    const { osType: _osType, ...withoutOsType } = VALID_VALUES
    expect(isValid(withoutOsType)).toEqual(false)
  })
})

describe('validateValues', () => {
  it('returns no errors for valid values', () => {
    expect(validateValues(VALID_VALUES)).toEqual({})
  })

  it('returns first error of each invalid field', () => {
    expect(
      validateValues({ ...VALID_VALUES, totalMemory: 'abc', cpuNum: '0', connectionNum: '5' })
    ).toEqual({
      totalMemory: 'Must be an integer',
      cpuNum: 'Must be greater than zero',
      connectionNum: 'Must be greater than or equal to 20'
    })
  })

  it('reports required and range errors', () => {
    expect(validateValues({ ...VALID_VALUES, totalMemory: '' })).toEqual({
      totalMemory: 'Required'
    })
    expect(validateValues({ ...VALID_VALUES, totalMemory: '1000000' })).toEqual({
      totalMemory: 'Must be less than or equal to 999999'
    })
    expect(validateValues({ ...VALID_VALUES, connectionNum: '260001' })).toEqual({
      connectionNum: 'Must be less than or equal to 260000'
    })
  })

  it('requires at least 512 MB of memory', () => {
    expect(validateValues({ ...VALID_VALUES, totalMemory: '511', totalMemoryUnit: 'MB' })).toEqual({
      totalMemory: 'Must be greater than or equal to 512 MB'
    })
    expect(validateValues({ ...VALID_VALUES, totalMemory: '512', totalMemoryUnit: 'MB' })).toEqual(
      {}
    )
    expect(validateValues({ ...VALID_VALUES, totalMemory: '1', totalMemoryUnit: 'GB' })).toEqual({})
  })

  it('rejects unsupported select values', () => {
    expect(validateValues({ ...VALID_VALUES, dbVersion: 'abc', osType: '' })).toEqual({
      dbVersion: 'Unsupported database version',
      osType: 'Required'
    })
  })
})
