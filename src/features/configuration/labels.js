import {
  OS_LINUX,
  OS_WINDOWS,
  OS_MAC,
  DB_TYPE_WEB,
  DB_TYPE_OLTP,
  DB_TYPE_DW,
  DB_TYPE_DESKTOP,
  DB_TYPE_MIXED,
  HARD_DRIVE_SSD,
  HARD_DRIVE_SAN,
  HARD_DRIVE_HDD,
  HARD_DRIVE_NVME,
  DB_SIZE_LESS_RAM,
  DB_SIZE_MID_RAM,
  DB_SIZE_GREATER_RAM
} from './constants'

// human readable names, shared by form and generated configuration

export const OS_TYPE_LABELS = {
  [OS_LINUX]: 'Linux',
  [OS_MAC]: 'macOS',
  [OS_WINDOWS]: 'Windows'
}

export const DB_TYPE_LABELS = {
  [DB_TYPE_WEB]: 'Web application',
  [DB_TYPE_OLTP]: 'Online transaction processing system',
  [DB_TYPE_DW]: 'Data warehouse',
  [DB_TYPE_DESKTOP]: 'Desktop application',
  [DB_TYPE_MIXED]: 'Mixed type of application'
}

export const HARD_DRIVE_LABELS = {
  [HARD_DRIVE_NVME]: 'NVMe storage',
  [HARD_DRIVE_SSD]: 'SSD storage',
  [HARD_DRIVE_SAN]: 'Network (SAN) storage',
  [HARD_DRIVE_HDD]: 'HDD storage'
}

export const DB_SIZE_LABELS = {
  [DB_SIZE_LESS_RAM]: 'Less than RAM',
  [DB_SIZE_MID_RAM]: '1x - 3x RAM',
  [DB_SIZE_GREATER_RAM]: 'More than 3x RAM'
}
