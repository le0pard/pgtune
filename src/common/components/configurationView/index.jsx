import { Fragment, useCallback } from 'react'
import classnames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import hljs from 'highlight.js/lib/core'
import iniLang from 'highlight.js/lib/languages/ini'
import sqlLang from 'highlight.js/lib/languages/sql'
import solarizedLight from './solarized-light'
import solarizedDark from './solarized-dark'
import { settingDescription, settingDocsUrl } from './settingsDocs'
import CopyButton from '@common/components/copyButton'
import { APP_THEMES_LIGHT, TAB_CONFIG, TAB_ALTER_SYSTEM } from '@features/settings/constants'
import {
  WARNING_LEVEL_STARTUP,
  WARNING_LEVEL_MEMORY,
  WARNING_LEVEL_NOTE
} from '@features/configuration/constants'
import {
  OS_TYPE_LABELS,
  DB_TYPE_LABELS,
  HARD_DRIVE_LABELS,
  DB_SIZE_LABELS
} from '@features/configuration/labels'
import {
  selectDBVersion,
  selectOSType,
  selectDBType,
  selectTotalMemory,
  selectTotalMemoryUnit,
  selectCPUNum,
  selectConnectionNum,
  selectHDType,
  selectDBSize,
  selectMaxConnections,
  selectSharedBuffers,
  selectEffectiveCacheSize,
  selectMaintenanceWorkMem,
  selectCheckpointSegments,
  selectCheckpointCompletionTarget,
  selectWalBuffers,
  selectDefaultStatisticsTarget,
  selectRandomPageCost,
  selectEffectiveIoConcurrency,
  selectMaintenanceIoConcurrency,
  selectParallelSettings,
  selectWorkMem,
  selectWarningInfoMessages,
  selectWalLevel,
  selectJit,
  selectWalCompression,
  selectAutovacuumMaxWorkers,
  selectAutovacuumWorkMem,
  selectIoWorkers,
  selectIoMethod,
  selectRestartRequiredSettings
} from '@features/configuration/configurationSlice'
import {
  openConfigTab,
  toggleIncludeWarnings,
  selectTabSettings,
  selectThemeSettings,
  selectIncludeWarningsSettings
} from '@features/settings/settingsSlice'

import './configuration-view.css'

hljs.registerLanguage('ini', iniLang)
hljs.registerLanguage('sql', sqlLang)

const KB_UNIT_MAP = {
  KB_PER_MB: 1024,
  KB_PER_GB: 1048576
}

// warnings are grouped and shown in this order
const WARNING_GROUPS = [
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

// This uses larger units only if there's no loss of resolution in displaying
// with that value. Therefore, if using this to output newly assigned
// values, that value needs to be rounded appropriately if you want
// it to show up as an even number of MB or GB
const formatValue = (value) => {
  const result = (() => {
    if (value % KB_UNIT_MAP['KB_PER_GB'] === 0) {
      return {
        value: Math.floor(value / KB_UNIT_MAP['KB_PER_GB']),
        unit: 'GB'
      }
    }
    if (value % KB_UNIT_MAP['KB_PER_MB'] === 0) {
      return {
        value: Math.floor(value / KB_UNIT_MAP['KB_PER_MB']),
        unit: 'MB'
      }
    }
    return {
      value,
      unit: 'kB'
    }
  })()

  // return formatted
  return `${result.value}${result.unit}`
}

const renderCodeInlineCss = (codeHighlightStyle) => {
  return Object.keys(codeHighlightStyle).map((className) => {
    const content = codeHighlightStyle[className]
    const body = Object.keys(content)
      .map((key) => `${key}: ${content[key]};`)
      .join('')

    return `.${className} { ${body} }`
  })
}

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Setting names (lowercase words with underscores) never appear in highlight.js
// markup itself, so they can be safely wrapped by links to documentation
const linkSettingNames = (html, settingKeys, dbVersion) => {
  if (settingKeys.length === 0) {
    return html
  }
  const settingNamesRegex = new RegExp(`\\b(${settingKeys.join('|')})\\b`, 'g')
  return html.replace(settingNamesRegex, (key) => {
    const docsUrl = settingDocsUrl(key, dbVersion)
    if (!docsUrl) {
      return key
    }
    return `<a class="configuration-view-setting" href="${docsUrl}" title="${escapeHtml(
      settingDescription(key)
    )}" target="_blank" rel="noopener noreferrer">${key}</a>`
  })
}

const renderHightlightedCode = (code, isAlterSystem, settingKeys, dbVersion) => {
  const html = hljs.highlight(code, { language: isAlterSystem ? 'sql' : 'ini' }).value
  return linkSettingNames(html, settingKeys, dbVersion)
}

const ConfigurationView = () => {
  const dispatch = useDispatch()

  // hardware configuration
  const dbVersion = useSelector(selectDBVersion)
  const osType = useSelector(selectOSType)
  const dbType = useSelector(selectDBType)
  const totalMemory = useSelector(selectTotalMemory)
  const totalMemoryUnit = useSelector(selectTotalMemoryUnit)
  const cpuNum = useSelector(selectCPUNum)
  const connectionNum = useSelector(selectConnectionNum)
  const hdType = useSelector(selectHDType)
  const dbSize = useSelector(selectDBSize)
  // computed settings
  const maxConnectionsVal = useSelector(selectMaxConnections)
  const sharedBuffersVal = useSelector(selectSharedBuffers)
  const effectiveCacheSizeVal = useSelector(selectEffectiveCacheSize)
  const maintenanceWorkMemVal = useSelector(selectMaintenanceWorkMem)
  const checkpointSegmentsVal = useSelector(selectCheckpointSegments)
  const walLevelVal = useSelector(selectWalLevel)
  const checkpointCompletionTargetVal = useSelector(selectCheckpointCompletionTarget)
  const walBuffersVal = useSelector(selectWalBuffers)
  const defaultStatisticsTargetVal = useSelector(selectDefaultStatisticsTarget)
  const randomPageCostVal = useSelector(selectRandomPageCost)
  const effectiveIoConcurrencyVal = useSelector(selectEffectiveIoConcurrency)
  const maintenanceIoConcurrencyVal = useSelector(selectMaintenanceIoConcurrency)
  const parallelSettingsVal = useSelector(selectParallelSettings)
  const workMemVal = useSelector(selectWorkMem)
  const jitVal = useSelector(selectJit)
  const walCompressionVal = useSelector(selectWalCompression)
  const autovacuumMaxWorkersVal = useSelector(selectAutovacuumMaxWorkers)
  const autovacuumWorkMemVal = useSelector(selectAutovacuumWorkMem)
  const ioMethodVal = useSelector(selectIoMethod)
  const ioWorkersVal = useSelector(selectIoWorkers)
  const restartRequiredSettingsVal = useSelector(selectRestartRequiredSettings)
  // warnings
  const warningInfoMessagesVal = useSelector(selectWarningInfoMessages)
  // tab state
  const tabState = useSelector(selectTabSettings)
  // include warnings in copied configuration
  const includeWarnings = useSelector(selectIncludeWarningsSettings)
  // app theme
  const theme = useSelector(selectThemeSettings)
  // tab click state
  const handleClickTab = useCallback((tab) => dispatch(openConfigTab(tab)), [dispatch])
  const handleToggleIncludeWarnings = useCallback(
    () => dispatch(toggleIncludeWarnings()),
    [dispatch]
  )

  const isAlterSystem = TAB_ALTER_SYSTEM === tabState
  const commentPrefix = isAlterSystem ? '--' : '#'

  const warningGroups = WARNING_GROUPS.map((group) => ({
    ...group,
    warnings: warningInfoMessagesVal.filter((warning) => warning.level === group.level)
  })).filter((group) => group.warnings.length > 0)

  const warningInfo = () =>
    warningGroups
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
      .map((line) => (line ? `${commentPrefix} ${line}` : commentPrefix))
      .join('\n')

  const hardwareConfiguration = () =>
    [
      ['DB Version', dbVersion],
      ['OS Type', OS_TYPE_LABELS[osType]],
      ['DB Type', DB_TYPE_LABELS[dbType]],
      ['Total Memory (RAM)', `${totalMemory} ${totalMemoryUnit}`],
      ['CPUs num', cpuNum],
      ['Connections num', connectionNum || `${maxConnectionsVal} (not provided, assumed)`],
      ['Data Storage', HARD_DRIVE_LABELS[hdType]],
      ['Total Data Size', DB_SIZE_LABELS[dbSize]]
    ]
      .filter((item) => !!item[1])
      .map((item) => `${commentPrefix} ${item[0]}: ${item[1]}`)
      .join('\n')

  const getCheckpointSegments = () =>
    checkpointSegmentsVal.map((item) => [item.key, formatValue(item.value)])

  const getWalLevel = () => walLevelVal.map((item) => [item.key, item.value])

  const getParallelSettings = () => parallelSettingsVal.map((item) => [item.key, item.value])

  const getIoWorkers = () => ioWorkersVal.map((item) => [item.key, item.value])

  const settingNote = (key) => {
    if (restartRequiredSettingsVal.includes(key)) {
      return 'restart required'
    }
    if (key === 'max_wal_size') {
      return 'needs free disk space'
    }
    return null
  }

  const postgresqlSettings = () =>
    [
      ['max_connections', maxConnectionsVal],
      ['shared_buffers', formatValue(sharedBuffersVal)],
      ['effective_cache_size', formatValue(effectiveCacheSizeVal)],
      ['maintenance_work_mem', formatValue(maintenanceWorkMemVal)],
      ['checkpoint_completion_target', checkpointCompletionTargetVal],
      ['wal_buffers', formatValue(walBuffersVal)],
      ['default_statistics_target', defaultStatisticsTargetVal],
      ['random_page_cost', randomPageCostVal],
      ['effective_io_concurrency', effectiveIoConcurrencyVal],
      ['maintenance_io_concurrency', maintenanceIoConcurrencyVal],
      ['work_mem', formatValue(workMemVal)],
      ['jit', jitVal],
      ['wal_compression', walCompressionVal],
      ['autovacuum_max_workers', autovacuumMaxWorkersVal],
      ['autovacuum_work_mem', autovacuumWorkMemVal ? formatValue(autovacuumWorkMemVal) : null],
      ['io_method', ioMethodVal]
    ]
      .concat(getIoWorkers())
      .concat(getCheckpointSegments())
      .concat(getParallelSettings())
      .concat(getWalLevel())
      .filter((item) => !!item[1])

  const postgresqlConfig = (settingsData) => {
    const settings = settingsData.map((item) => ({
      line: isAlterSystem
        ? `ALTER SYSTEM SET ${item[0]} = '${item[1]}';`
        : `${item[0]} = ${item[1]}`,
      note: settingNote(item[0])
    }))

    // align notes in one column
    const lineWidth = Math.max(...settings.map((item) => item.line.length))

    return settings
      .map((item) =>
        item.note ? `${item.line.padEnd(lineWidth)} ${commentPrefix} ${item.note}` : item.line
      )
      .join('\n')
  }

  const renderTabs = () => {
    return (
      <div className="configuration-view-tabs-wrapper">
        <button
          className={classnames('configuration-view-tab', {
            'configuration-view-tab--active': TAB_CONFIG === tabState
          })}
          onClick={() => handleClickTab(TAB_CONFIG)}
        >
          postgresql.conf
        </button>
        <button
          className={classnames('configuration-view-tab', {
            'configuration-view-tab--active': TAB_ALTER_SYSTEM === tabState
          })}
          onClick={() => handleClickTab(TAB_ALTER_SYSTEM)}
        >
          ALTER SYSTEM
        </button>
      </div>
    )
  }

  const renderWarnings = () => {
    if (warningGroups.length === 0) {
      return null
    }

    return (
      <div className="configuration-view-warnings">
        {warningGroups.map((group) => (
          <div
            key={group.level}
            className={classnames(
              'configuration-view-warning',
              `configuration-view-warning--${group.level}`
            )}
          >
            <div className="configuration-view-warning__title">{group.title}</div>
            {group.warnings.map((warning, index) => (
              <div key={index} className="configuration-view-warning__item">
                <span>{warning.text.join(' ')}</span>
                {warning.code && (
                  <code className="configuration-view-warning__code">{warning.code}</code>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  const renderConfigResult = () => {
    const settingsData = postgresqlSettings()
    const settingKeys = settingsData.map((item) => item[0])
    const generatedConfigRes = [hardwareConfiguration(), '', postgresqlConfig(settingsData)].join(
      '\n'
    )
    const copiedConfigRes =
      includeWarnings && warningGroups.length > 0
        ? [warningInfo(), '', generatedConfigRes].join('\n')
        : generatedConfigRes

    return (
      <Fragment>
        {isAlterSystem ? (
          <p>
            <strong>ALTER SYSTEM</strong> writes the given parameter setting to the{' '}
            <strong>postgresql.auto.conf</strong> file, which is read in addition to{' '}
            <strong>postgresql.conf</strong>. Settings marked as &quot;restart required&quot; take
            effect only after database restart, others after{' '}
            <strong>SELECT pg_reload_conf();</strong>
          </p>
        ) : (
          <p>
            Add/modify these settings in <strong>postgresql.conf</strong> and restart the database
          </p>
        )}
        {renderWarnings()}
        <div className="configuration-view-code">
          <CopyButton
            className="configuration-view-copy-top-button"
            text={copiedConfigRes}
            label="Copy"
          />
          <pre style={{ display: 'block', overflowX: 'auto', padding: '0.5rem' }}>
            <code
              style={{ whiteSpace: 'pre' }}
              dangerouslySetInnerHTML={{
                __html: renderHightlightedCode(
                  generatedConfigRes,
                  isAlterSystem,
                  settingKeys,
                  dbVersion
                )
              }}
            />
          </pre>
        </div>
        {warningGroups.length > 0 && (
          <label className="configuration-view-include-warnings">
            <input
              type="checkbox"
              className="configuration-view-include-warnings__input"
              checked={includeWarnings}
              onChange={handleToggleIncludeWarnings}
            />
            <span>Include warnings as comments when copying</span>
          </label>
        )}
        <div className="configuration-view-copy-wrapper">
          <CopyButton
            className="configuration-view-copy-button"
            text={copiedConfigRes}
            label="Copy configuration"
          />
        </div>
        <ul className="configuration-view-footnotes">
          <li>
            Apply the same settings on replicas: <strong>max_connections</strong> and{' '}
            <strong>max_worker_processes</strong> on a standby must be the same or higher than on
            the primary
          </li>
          <li>
            Hover a setting name to see what it does, click it to open PostgreSQL documentation
          </li>
        </ul>
      </Fragment>
    )
  }

  const codeHighlightStyle = APP_THEMES_LIGHT === theme ? solarizedLight : solarizedDark

  return (
    <div>
      {renderTabs()}
      {renderConfigResult()}
      <style>{renderCodeInlineCss(codeHighlightStyle)}</style>
    </div>
  )
}

export default ConfigurationView
