import * as v from 'valibot'
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
  SIZE_UNIT_TB,
  HARD_DRIVE_HDD,
  HARD_DRIVE_SSD,
  HARD_DRIVE_SAN,
  HARD_DRIVE_NVME,
  MAX_NUMERIC_VALUE,
  MAX_CONNECTIONS_VALUE,
  DB_SIZE_LESS_RAM,
  DB_SIZE_MID_RAM,
  DB_SIZE_GREATER_RAM
} from './constants'

const MIN_MB_MEMORY = 512

const DB_TYPES = [DB_TYPE_WEB, DB_TYPE_OLTP, DB_TYPE_DW, DB_TYPE_DESKTOP, DB_TYPE_MIXED]

const HARD_DRIVE_TYPES = [HARD_DRIVE_HDD, HARD_DRIVE_SSD, HARD_DRIVE_SAN, HARD_DRIVE_NVME]

const DB_SIZES = [DB_SIZE_LESS_RAM, DB_SIZE_MID_RAM, DB_SIZE_GREATER_RAM]

const isEmpty = (value) => value === '' || value === null || value === undefined

// numeric fields are text inputs, so only digits are allowed (values like "1e3" or "16GB"
// would be parsed differently by configuration), surrounding spaces are ignored like by parseInt
const isDigits = (value) => /^\d+$/.test(String(value).trim())

// missing value is validated as empty string, so required fields report "Required"
const field = (...actions) => v.optional(v.pipe(v.unknown(), ...actions), '')

const selectField = (options, message) =>
  field(
    v.check((value) => !isEmpty(value), 'Required'),
    v.check((value) => isEmpty(value) || options.map(String).includes(String(value)), message)
  )

const numberField = ({ required = false, min, minMessage, max, maxMessage }) =>
  field(
    v.check((value) => !required || !isEmpty(value), 'Required'),
    v.check((value) => isEmpty(value) || isDigits(value), 'Must be an integer'),
    v.check((value) => isEmpty(value) || !isDigits(value) || Number(value) >= min, minMessage),
    v.check((value) => isEmpty(value) || !isDigits(value) || Number(value) <= max, maxMessage)
  )

export const validationSchema = v.pipe(
  v.object({
    dbVersion: selectField(DB_VERSIONS, 'Unsupported database version'),
    osType: selectField([OS_LINUX, OS_WINDOWS, OS_MAC], 'Unsupported OS'),
    dbType: selectField(DB_TYPES, 'Unsupported database type'),
    totalMemoryUnit: selectField([SIZE_UNIT_MB, SIZE_UNIT_GB, SIZE_UNIT_TB], 'Unsupported unit'),
    totalMemory: numberField({
      required: true,
      min: 1,
      minMessage: 'Must be greater than zero',
      max: MAX_NUMERIC_VALUE,
      maxMessage: `Must be less than or equal to ${MAX_NUMERIC_VALUE}`
    }),
    hdType: selectField(HARD_DRIVE_TYPES, 'Unsupported hard drive'),
    dbSize: selectField(DB_SIZES, 'Unsupported db size'),
    cpuNum: numberField({
      min: 1,
      minMessage: 'Must be greater than zero',
      max: MAX_NUMERIC_VALUE,
      maxMessage: `Must be less than or equal to ${MAX_NUMERIC_VALUE}`
    }),
    connectionNum: numberField({
      min: 20,
      minMessage: 'Must be greater than or equal to 20',
      max: MAX_CONNECTIONS_VALUE,
      maxMessage: `Must be less than or equal to ${MAX_CONNECTIONS_VALUE}`
    })
  }),
  // memory in megabytes has higher minimum
  v.forward(
    v.partialCheck(
      [['totalMemory'], ['totalMemoryUnit']],
      ({ totalMemory, totalMemoryUnit }) =>
        totalMemoryUnit !== SIZE_UNIT_MB ||
        !isDigits(totalMemory) ||
        Number(totalMemory) < 1 ||
        Number(totalMemory) >= MIN_MB_MEMORY,
      `Must be greater than or equal to ${MIN_MB_MEMORY} MB`
    ),
    ['totalMemory']
  )
)

export const isValid = (values) => v.is(validationSchema, values)

// errors by field name, first message of each field (format of Formik errors)
export const validateValues = (values) => {
  const result = v.safeParse(validationSchema, values)
  if (result.success) {
    return {}
  }
  return result.issues.reduce((errors, issue) => {
    const name = issue.path?.[0]?.key
    if (name !== undefined && !(name in errors)) {
      errors[name] = issue.message
    }
    return errors
  }, {})
}
