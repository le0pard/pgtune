import { validationSchema } from '../validation'

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

describe('validationSchema', () => {
  it('accepts valid values with empty optional fields', () => {
    expect(validationSchema.isValidSync(VALID_VALUES)).toEqual(true)
  })

  it('accepts digits in numeric fields', () => {
    expect(
      validationSchema.isValidSync({ ...VALID_VALUES, cpuNum: '8', connectionNum: '300' })
    ).toEqual(true)
  })

  it('rejects numbers, which are not plain digits', () => {
    ;['1e3', '16GB', '1.5', '-4', 'abc'].forEach((value) => {
      expect(validationSchema.isValidSync({ ...VALID_VALUES, totalMemory: value })).toEqual(false)
      expect(validationSchema.isValidSync({ ...VALID_VALUES, cpuNum: value })).toEqual(false)
      expect(validationSchema.isValidSync({ ...VALID_VALUES, connectionNum: value })).toEqual(false)
    })
  })

  it('requires total memory', () => {
    expect(validationSchema.isValidSync({ ...VALID_VALUES, totalMemory: '' })).toEqual(false)
  })

  it('shows integer error for invalid total memory', () => {
    expect(() => validationSchema.validateSyncAt('totalMemory', { totalMemory: 'abc' })).toThrow(
      'Must be an integer'
    )
  })
})
