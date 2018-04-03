// postgresql versions
export const DEFAULT_DB_VERSION = 10
export const DB_VERSIONS = [DEFAULT_DB_VERSION, 9.6, 9.5, 9.4, 9.3, 9.2]
// os types
export const OS_LINUX = 'linux'
export const OS_WINDOWS = 'windows'
// db types
export const DB_TYPE_WEB = 'web'
export const DB_TYPE_OLTP = 'oltp'
export const DB_TYPE_DW = 'dw'
export const DB_TYPE_DESKTOP = 'desktop'
export const DB_TYPE_MIXED = 'mixed'
// size units
export const SIZE_UNIT_MB = 'MB'
export const SIZE_UNIT_GB = 'GB'
export const SIZE_UNIT_MAP = {
  KB: 1024,
  MB: 1048576,
  GB: 1073741824,
  TB: 1099511627776,
  KB_PER_MB: 1024,
  KB_PER_GB: 1048576
}
// harddrive types
export const HARD_DRIVE_HDD = 'hdd'
export const HARD_DRIVE_SSD = 'ssd'
export const HARD_DRIVE_SAN = 'san'
