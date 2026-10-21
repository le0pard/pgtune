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

// segment tokens, used to highlight configuration
export const TOKEN_COMMENT = 'comment'
export const TOKEN_KEYWORD = 'keyword'
export const TOKEN_NAME = 'name'
export const TOKEN_VALUE = 'value'

// configuration line is an array of segments: { text, token }, segment without token is plain text
const commentLine = (text) => [{ text, token: TOKEN_COMMENT }]

const segmentsLength = (segments) =>
  segments.reduce((length, segment) => length + segment.text.length, 0)

// joins lines of segments to text
export const linesText = (lines) =>
  lines.map((line) => line.map((segment) => segment.text).join('')).join('\n')

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

// provided parameters as comment lines
export const hardwareLines = (hardware, { isAlterSystem = false } = {}) =>
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
    .map((item) => commentLine(`${commentPrefix(isAlterSystem)} ${item[0]}: ${item[1]}`))

export const hardwareText = (hardware, options) => linesText(hardwareLines(hardware, options))

// setting lines with notes aligned in one column
export const settingLines = (
  settings,
  { isAlterSystem = false, restartRequiredSettings = [] } = {}
) => {
  const lines = settings.map((setting) => {
    const value = formatSettingValue(setting)
    return {
      segments: isAlterSystem
        ? [
            { text: 'ALTER SYSTEM SET', token: TOKEN_KEYWORD },
            { text: ' ' },
            { text: setting.key, token: TOKEN_NAME },
            { text: ' = ' },
            { text: `'${value}'`, token: TOKEN_VALUE },
            { text: ';' }
          ]
        : [
            { text: setting.key, token: TOKEN_NAME },
            { text: ' = ' },
            { text: value, token: TOKEN_VALUE }
          ],
      note: settingNote(setting.key, restartRequiredSettings)
    }
  })

  const lineWidth = Math.max(...lines.map((item) => segmentsLength(item.segments)))

  return lines.map(({ segments, note }) =>
    note
      ? [
          ...segments,
          { text: ' '.repeat(lineWidth - segmentsLength(segments) + 1) },
          { text: `${commentPrefix(isAlterSystem)} ${note}`, token: TOKEN_COMMENT }
        ]
      : segments
  )
}

export const settingsText = (settings, options) => linesText(settingLines(settings, options))

// warnings as comment lines, grouped by level
export const warningLines = (warnings, { isAlterSystem = false } = {}) =>
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
      commentLine(line ? `${commentPrefix(isAlterSystem)} ${line}` : commentPrefix(isAlterSystem))
    )

export const warningsText = (warnings, options) => linesText(warningLines(warnings, options))

// lines - shown configuration as segments (for highlighting), text - shown configuration,
// copyText - copied configuration (with warnings, if included)
export const configurationText = ({
  hardware,
  settings,
  warnings = [],
  restartRequiredSettings = [],
  isAlterSystem = false,
  includeWarnings = true
}) => {
  const lines = [
    ...hardwareLines(hardware, { isAlterSystem }),
    [],
    ...settingLines(settings, { isAlterSystem, restartRequiredSettings })
  ]
  const text = linesText(lines)

  const copyText =
    includeWarnings && warnings.length > 0
      ? [warningsText(warnings, { isAlterSystem }), '', text].join('\n')
      : text

  return { lines, text, copyText }
}
