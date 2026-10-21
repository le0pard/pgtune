import { Fragment, useCallback } from 'react'
import classnames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import hljs from 'highlight.js/lib/core'
import iniLang from 'highlight.js/lib/languages/ini'
import sqlLang from 'highlight.js/lib/languages/sql'
import solarizedLight from './solarized-light'
import solarizedDark from './solarized-dark'
import CopyButton from '@common/components/copyButton'
import { APP_THEMES_LIGHT, TAB_CONFIG, TAB_ALTER_SYSTEM } from '@features/settings/constants'
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
  selectTabSettings,
  selectThemeSettings
} from '@features/settings/settingsSlice'

import './configuration-view.css'

hljs.registerLanguage('ini', iniLang)
hljs.registerLanguage('sql', sqlLang)

const KB_UNIT_MAP = {
  KB_PER_MB: 1024,
  KB_PER_GB: 1048576
}

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

const renderHightlightedCode = (code, isAlterSystem) => {
  return hljs.highlight(code, { language: isAlterSystem ? 'sql' : 'ini' }).value
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
  // app theme
  const theme = useSelector(selectThemeSettings)
  // tab click state
  const handleClickTab = useCallback((tab) => dispatch(openConfigTab(tab)), [dispatch])

  const isAlterSystem = TAB_ALTER_SYSTEM === tabState
  const commentPrefix = isAlterSystem ? '--' : '#'

  const warningInfo = () =>
    warningInfoMessagesVal.map((item) => `${commentPrefix} ${item}`).join('\n')

  const hardwareConfiguration = () =>
    [
      ['DB Version', dbVersion],
      ['OS Type', osType],
      ['DB Type', dbType],
      ['Total Memory (RAM)', `${totalMemory} ${totalMemoryUnit}`],
      ['CPUs num', cpuNum],
      ['Connections num', connectionNum || `${maxConnectionsVal} (not provided, assumed)`],
      ['Data Storage', hdType],
      ['Total Data Size', dbSize]
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
      return 'needs at least this much free disk space for WAL'
    }
    return null
  }

  const postgresqlConfig = () => {
    const configData = [
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

    const settings = configData
      .filter((item) => !!item[1])
      .map((item) => ({
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

  const generateConfig = () => {
    let config = [hardwareConfiguration(), '', postgresqlConfig()]

    if (warningInfoMessagesVal.length > 0) {
      config = [warningInfo(), '', ...config]
    }
    return config.join('\n')
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

  const renderConfigResult = () => {
    const generatedConfigRes = generateConfig()

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
            Add/modify this settings in <strong>postgresql.conf</strong> and restart database
          </p>
        )}
        <p>
          Apply the same settings on replicas: <strong>max_connections</strong> and{' '}
          <strong>max_worker_processes</strong> on a standby must be the same or higher than on the
          primary
        </p>
        <pre style={{ display: 'block', overflowX: 'auto', padding: '0.5rem' }}>
          <code
            style={{ whiteSpace: 'pre' }}
            dangerouslySetInnerHTML={{
              __html: renderHightlightedCode(generatedConfigRes, isAlterSystem)
            }}
          />
        </pre>
        <div className="configuration-view-copy-wrapper">
          <CopyButton
            className="configuration-view-copy-button"
            text={generatedConfigRes}
            label="Copy configuration"
          />
        </div>
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
