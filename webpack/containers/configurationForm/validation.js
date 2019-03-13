import _isInteger from 'lodash/isInteger'
import {
  DB_VERSIONS,
  OS_LINUX,
  OS_WINDOWS,
  OS_MAC,
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED,
  SIZE_UNIT_MB,
  SIZE_UNIT_GB,
  HARD_DRIVE_HDD,
  HARD_DRIVE_SSD,
  HARD_DRIVE_SAN
} from 'reducers/configuration/constants'

const MAX_INTEGER = 9999

const DB_TYPES = [
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED
]

const HARD_DRIVE_TYPES = [
  HARD_DRIVE_HDD,
  HARD_DRIVE_SSD,
  HARD_DRIVE_SAN
]

export const validate = (values) => {
  const errors = {}
  if (!values.dbVersion) {
    errors.dbVersion = 'Required'
  } else {
    const dbVersion = parseFloat(values.dbVersion)
    if (DB_VERSIONS.indexOf(dbVersion) < 0) {
      errors.dbVersion = 'Unsupported database version'
    }
  }
  if (!values.osType) {
    errors.osType = 'Required'
  } else if ([OS_LINUX, OS_WINDOWS, OS_MAC].indexOf(values.osType) < 0) {
    errors.osType = 'Unsupported OS'
  }
  if (!values.dbType) {
    errors.dbType = 'Required'
  } else if (DB_TYPES.indexOf(values.dbType) < 0) {
    errors.dbType = 'Unsupported database type'
  }
  if (!values.totalMemory) {
    errors.totalMemory = 'Required'
  } else {
    const totalMemory = parseInt(values.totalMemory, 10)
    if (!_isInteger(totalMemory)) {
      errors.totalMemory = 'Must be an integer'
    } else if (totalMemory < 1) {
      errors.totalMemory = 'Must be greater than zero'
    } else if (totalMemory > MAX_INTEGER) {
      errors.totalMemory = `Must be less than or equal to ${MAX_INTEGER}`
    }
  }
  if (!values.totalMemoryUnit) {
    errors.totalMemoryUnit = 'Required'
  } else if ([SIZE_UNIT_MB, SIZE_UNIT_GB].indexOf(values.totalMemoryUnit) < 0) {
    errors.totalMemoryUnit = 'Unsupported unit'
  }
  const MIN_MEMORY = 512
  if (
    values.totalMemory &&
    parseInt(values.totalMemory, 10) < MIN_MEMORY &&
    values.totalMemoryUnit &&
    SIZE_UNIT_MB === values.totalMemoryUnit
  ) {
    errors.totalMemory = `Must be greater than or equal to ${MIN_MEMORY} MB`
  }
  if (!values.hdType) {
    errors.hdType = 'Required'
  } else if (HARD_DRIVE_TYPES.indexOf(values.hdType) < 0) {
    errors.hdType = 'Unsupported hard drive'
  }
  if (values.cpuNum) {
    const cpuNum = parseInt(values.cpuNum, 10)
    if (!_isInteger(cpuNum)) {
      errors.cpuNum = 'Must be an integer'
    } else if (cpuNum < 1) {
      errors.cpuNum = 'Must be greater than zero'
    } else if (cpuNum > MAX_INTEGER) {
      errors.cpuNum = `Must be less than or equal to ${MAX_INTEGER}`
    }
  }
  if (values.connectionNum) {
    const connectionNum = parseInt(values.connectionNum, 10)
    if (!_isInteger(connectionNum)) {
      errors.connectionNum = 'Must be an integer'
    } else if (connectionNum < 10) {
      errors.connectionNum = 'Must be greater than or equal to 10'
    } else if (connectionNum > MAX_INTEGER) {
      errors.connectionNum = `Must be less than or equal to ${MAX_INTEGER}`
    }
  }
  return errors
}
