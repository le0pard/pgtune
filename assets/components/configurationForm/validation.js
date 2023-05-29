import * as Yup from 'yup'
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
const MIN_MB_MEMORY = 512

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

export const validationSchema = Yup.object().shape({
  dbVersion: Yup.number()
    .required('Required')
    .oneOf(DB_VERSIONS, 'Unsupported database version'),
  osType: Yup.string()
    .required('Required')
    .oneOf([OS_LINUX, OS_WINDOWS, OS_MAC], 'Unsupported OS'),
  dbType: Yup.string()
    .required('Required')
    .oneOf(DB_TYPES, 'Unsupported database type'),
  totalMemoryUnit: Yup.string()
    .required('Required')
    .oneOf([SIZE_UNIT_MB, SIZE_UNIT_GB], 'Unsupported unit'),
  totalMemory: Yup.number()
    .required('Required')
    .integer('Must be an integer')
    .when('totalMemoryUnit', (totalMemoryUnit, schema) => {
      if (totalMemoryUnit === SIZE_UNIT_MB) {
        return schema.min(MIN_MB_MEMORY, `Must be greater than or equal to ${MIN_MB_MEMORY} MB`)
      }
      return schema.min(1, 'Must be greater than zero')
    })
    .max(MAX_INTEGER, `Must be less than or equal to ${MAX_INTEGER}`),
  hdType: Yup.string()
    .required('Required')
    .oneOf(HARD_DRIVE_TYPES, 'Unsupported hard drive'),
  cpuNum: Yup.number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .notRequired()
    .integer('Must be an integer')
    .min(1, 'Must be greater than zero')
    .max(MAX_INTEGER, `Must be less than or equal to ${MAX_INTEGER}`),
  connectionNum: Yup.number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .notRequired()
    .integer('Must be an integer')
    .min(20, 'Must be greater than or equal to 20')
    .max(MAX_INTEGER, `Must be less than or equal to ${MAX_INTEGER}`)
})
