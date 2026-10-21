import {
  FORM_DEFAULTS,
  normalizeConfiguration,
  formValuesFromParams,
  configurationFromParams
} from '../configurationParams'

const VALID_PARAMS =
  'dbVersion=18&osType=linux&dbType=web&cpuNum=&totalMemory=16&totalMemoryUnit=GB&connectionNum=300&hdType=ssd&dbSize=mid_ram'

const params = (query) => new URLSearchParams(query)

describe('normalizeConfiguration', () => {
  it('converts form values to configuration', () => {
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

describe('formValuesFromParams', () => {
  it('uses defaults without params', () => {
    expect(formValuesFromParams(params(''))).toBe(FORM_DEFAULTS)
  })

  it('uses valid params and ignores unknown ones', () => {
    expect(formValuesFromParams(params(`${VALID_PARAMS}&utm_source=test`))).toEqual({
      ...FORM_DEFAULTS,
      dbVersion: '18',
      totalMemory: '16',
      connectionNum: '300'
    })
  })

  it('falls back to defaults, if any param is invalid or missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // repeated param: last value is used
    expect(formValuesFromParams(params(`${VALID_PARAMS}&osType=amiga`))).toBe(FORM_DEFAULTS)
    expect(formValuesFromParams(params('totalMemory=8&dbType=oltp'))).toBe(FORM_DEFAULTS)
    expect(warn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })
})

describe('configurationFromParams', () => {
  it('is configured, when total memory is provided', () => {
    const { values, configuration, isConfigured } = configurationFromParams(params(VALID_PARAMS))
    expect(isConfigured).toEqual(true)
    expect(configuration).toEqual(normalizeConfiguration(values))
    expect(configuration.totalMemory).toEqual(16)
  })

  it('is not configured without total memory', () => {
    expect(configurationFromParams(params('')).isConfigured).toEqual(false)
    expect(configurationFromParams(params('dbType=dw')).isConfigured).toEqual(false)
  })
})
