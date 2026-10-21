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

// DB types are described by workload only, database size is a separate parameter.
// Summary starts with lowercase, as it follows type name in help text
export const DB_TYPE_DESCRIPTIONS = {
  [DB_TYPE_WEB]: {
    summary: 'many short, simple queries, mostly reads',
    examples: 'websites, APIs, SaaS backends'
  },
  [DB_TYPE_OLTP]: {
    summary: 'many concurrent short transactions with frequent writes',
    examples: 'payments, orders, bookings, inventory'
  },
  [DB_TYPE_DW]: {
    summary: 'few long analytical queries over large amounts of data, bulk data loads',
    examples: 'reporting, analytics, business intelligence'
  },
  [DB_TYPE_DESKTOP]: {
    summary: 'PostgreSQL shares the computer with other programs and uses little memory',
    examples: 'developer workstation, local or test database, desktop application'
  },
  [DB_TYPE_MIXED]: {
    summary: 'both short transactions and heavy analytical queries',
    examples: 'application, which also runs reports on the same database'
  }
}
