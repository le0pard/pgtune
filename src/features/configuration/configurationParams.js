// Configuration is stored only in url params, these pure functions read it from there

import {
  DEFAULT_DB_VERSION,
  OS_LINUX,
  DB_TYPE_WEB,
  SIZE_UNIT_GB,
  HARD_DRIVE_SSD,
  DB_SIZE_MID_RAM
} from './constants'
import { isValid, validateValues } from './validation'

export const FORM_DEFAULTS = {
  dbVersion: DEFAULT_DB_VERSION,
  osType: OS_LINUX,
  dbType: DB_TYPE_WEB,
  cpuNum: '',
  totalMemory: '',
  totalMemoryUnit: SIZE_UNIT_GB,
  connectionNum: '',
  hdType: HARD_DRIVE_SSD,
  dbSize: DB_SIZE_MID_RAM
}

const FORM_FIELDS = Object.keys(FORM_DEFAULTS)

// converts form values (strings) to configuration, used by selectors
export const normalizeConfiguration = (values) => ({
  dbVersion: parseFloat(values.dbVersion),
  osType: values.osType,
  dbType: values.dbType,
  totalMemory: parseInt(values.totalMemory, 10),
  totalMemoryUnit: values.totalMemoryUnit,
  cpuNum: values.cpuNum ? parseInt(values.cpuNum, 10) : null,
  connectionNum: values.connectionNum ? parseInt(values.connectionNum, 10) : null,
  hdType: values.hdType,
  dbSize: values.dbSize
})

// form values from url params: unknown params are ignored, defaults are used,
// if any param is invalid or missing (form always writes all params to url)
export const formValuesFromParams = (searchParams) => {
  // last value wins, if param is repeated
  const allParams = Object.fromEntries(searchParams.entries())
  const params = FORM_FIELDS.reduce((result, key) => {
    if (key in allParams) {
      result[key] = allParams[key]
    }
    return result
  }, {})

  if (Object.keys(params).length === 0) {
    return FORM_DEFAULTS
  }

  if (!isValid(params)) {
    console.warn('Url params error', validateValues(params))
    return FORM_DEFAULTS
  }

  return { ...FORM_DEFAULTS, ...params }
}

// values - form values, configuration - normalized values for selectors,
// isConfigured - configuration can be generated (required params are provided)
export const configurationFromParams = (searchParams) => {
  const values = formValuesFromParams(searchParams)
  const configuration = normalizeConfiguration(values)
  return {
    values,
    configuration,
    isConfigured: !!configuration.totalMemory
  }
}
