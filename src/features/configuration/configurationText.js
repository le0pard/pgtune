// Pure functions, which build configuration text (postgresql.conf or ALTER SYSTEM)
// from provided parameters, generated settings and warnings

import { WARNING_LEVEL_STARTUP, WARNING_LEVEL_MEMORY, WARNING_LEVEL_NOTE } from './constants'
import { OS_TYPE_LABELS, DB_TYPE_LABELS, HARD_DRIVE_LABELS, DB_SIZE_LABELS } from './labels'

const KB_UNIT_MAP = {
  KB_PER_MB: 1024,
  KB_PER_GB: 1048576
}

// warnings are grouped and shown in this order
export const WARNING_GROUPS = [
  {
    level: WARNING_LEVEL_STARTUP,
    title: 'May prevent startup',
    commentTitle: 'WARNING (may prevent startup)'
  },
  {
    level: WARNING_LEVEL_MEMORY,
    title: 'Memory risk',
    commentTitle: 'WARNING (memory risk)'
  },
  {
    level: WARNING_LEVEL_NOTE,
    title: 'Note',
    commentTitle: 'NOTE'
  }
]

const commentPrefix = (isAlterSystem) => (isAlterSystem ? '--' : '#')

// This uses larger units only if there's no loss of resolution in displaying
// with that value. Therefore, if using this to output newly assigned
// values, that value needs to be rounded appropriately if you want
// it to show up as an even number of MB or GB
export const formatMemory = (valueKb) => {
  if (valueKb % KB_UNIT_MAP['KB_PER_GB'] === 0) {
    return `${Math.floor(valueKb / KB_UNIT_MAP['KB_PER_GB'])}GB`
  }
  if (valueKb % KB_UNIT_MAP['KB_PER_MB'] === 0) {
    return `${Math.floor(valueKb / KB_UNIT_MAP['KB_PER_MB'])}MB`
  }
  return `${valueKb}kB`
}

export const formatSettingValue = (setting) =>
  setting.isMemory ? formatMemory(setting.value) : String(setting.value)

// groups warnings by level, empty groups are omitted
export const groupWarnings = (warnings) =>
  WARNING_GROUPS.map((group) => ({
    ...group,
    warnings: warnings.filter((warning) => warning.level === group.level)
  })).filter((group) => group.warnings.length > 0)

// note at the end of setting line
const settingNote = (key, restartRequiredSettings) => {
  if (restartRequiredSettings.includes(key)) {
    return 'restart required'
  }
  if (key === 'max_wal_size') {
    return 'needs free disk space'
  }
  return null
}

// provided parameters as comments
export const hardwareText = (hardware, { isAlterSystem = false } = {}) =>
  [
    ['DB Version', hardware.dbVersion],
    ['OS Type', OS_TYPE_LABELS[hardware.osType]],
    ['DB Type', DB_TYPE_LABELS[hardware.dbType]],
    ['Total Memory (RAM)', `${hardware.totalMemory} ${hardware.totalMemoryUnit}`],
    ['CPUs num', hardware.cpuNum],
    [
      'Connections num',
      hardware.connectionNum || `${hardware.maxConnections} (not provided, assumed)`
    ],
    ['Data Storage', HARD_DRIVE_LABELS[hardware.hdType]],
    ['Total Data Size', DB_SIZE_LABELS[hardware.dbSize]]
  ]
    .filter((item) => !!item[1])
    .map((item) => `${commentPrefix(isAlterSystem)} ${item[0]}: ${item[1]}`)
    .join('\n')

// setting lines with notes aligned in one column
export const settingsText = (
  settings,
  { isAlterSystem = false, restartRequiredSettings = [] } = {}
) => {
  const lines = settings.map((setting) => {
    const value = formatSettingValue(setting)
    return {
      line: isAlterSystem
        ? `ALTER SYSTEM SET ${setting.key} = '${value}';`
        : `${setting.key} = ${value}`,
      note: settingNote(setting.key, restartRequiredSettings)
    }
  })

  const lineWidth = Math.max(...lines.map((item) => item.line.length))

  return lines
    .map((item) =>
      item.note
        ? `${item.line.padEnd(lineWidth)} ${commentPrefix(isAlterSystem)} ${item.note}`
        : item.line
    )
    .join('\n')
}

// warnings as comments, grouped by level
export const warningsText = (warnings, { isAlterSystem = false } = {}) =>
  groupWarnings(warnings)
    .map((group) => [
      group.commentTitle,
      ...group.warnings.flatMap((warning, index) => [
        ...(index > 0 ? [''] : []),
        ...warning.text,
        ...(warning.code ? [warning.code] : [])
      ])
    ])
    .reduce(
      (lines, groupLines) => (lines.length > 0 ? [...lines, '', ...groupLines] : groupLines),
      []
    )
    .map((line) =>
      line ? `${commentPrefix(isAlterSystem)} ${line}` : commentPrefix(isAlterSystem)
    )
    .join('\n')

// text - shown configuration, copyText - copied configuration (with warnings, if included)
export const configurationText = ({
  hardware,
  settings,
  warnings = [],
  restartRequiredSettings = [],
  isAlterSystem = false,
  includeWarnings = true
}) => {
  const text = [
    hardwareText(hardware, { isAlterSystem }),
    '',
    settingsText(settings, { isAlterSystem, restartRequiredSettings })
  ].join('\n')

  const copyText =
    includeWarnings && warnings.length > 0
      ? [warningsText(warnings, { isAlterSystem }), '', text].join('\n')
      : text

  return { text, copyText }
}
