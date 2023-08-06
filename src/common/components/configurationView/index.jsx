import React, { useCallback } from 'react'
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
  selectParallelSettings,
  selectWorkMem,
  selectWarningInfoMessages
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
  // computed settings
  const maxConnectionsVal = useSelector(selectMaxConnections)
  const sharedBuffersVal = useSelector(selectSharedBuffers)
  const effectiveCacheSizeVal = useSelector(selectEffectiveCacheSize)
  const maintenanceWorkMemVal = useSelector(selectMaintenanceWorkMem)
  const checkpointSegmentsVal = useSelector(selectCheckpointSegments)
  const checkpointCompletionTargetVal = useSelector(selectCheckpointCompletionTarget)
  const walBuffersVal = useSelector(selectWalBuffers)
  const defaultStatisticsTargetVal = useSelector(selectDefaultStatisticsTarget)
  const randomPageCostVal = useSelector(selectRandomPageCost)
  const effectiveIoConcurrencyVal = useSelector(selectEffectiveIoConcurrency)
  const parallelSettingsVal = useSelector(selectParallelSettings)
  const workMemVal = useSelector(selectWorkMem)
  // warnings
  const warningInfoMessagesVal = useSelector(selectWarningInfoMessages)
  // tab state
  const tabState = useSelector(selectTabSettings)
  // app theme
  const theme = useSelector(selectThemeSettings)
  // tab click state
  const handleClickTab = useCallback((tab) => dispatch(openConfigTab(tab)), [dispatch])

  const isAlterSystem = TAB_ALTER_SYSTEM === tabState

  const warningInfo = () =>
    warningInfoMessagesVal.map((item) => `${isAlterSystem ? '--' : '#'} ${item}`).join('\n')

  const hardwareConfiguration = () =>
    [
      ['DB Version', dbVersion],
      ['OS Type', osType],
      ['DB Type', dbType],
      ['Total Memory (RAM)', `${totalMemory} ${totalMemoryUnit}`],
      ['CPUs num', cpuNum],
      ['Connections num', connectionNum],
      ['Data Storage', hdType]
    ]
      .filter((item) => !!item[1])
      .map((item) => `${isAlterSystem ? '--' : '#'} ${item[0]}: ${item[1]}`)
      .join('\n')

  const getCheckpointSegments = () =>
    checkpointSegmentsVal.map((item) => {
      if (item.key === 'checkpoint_segments') {
        return [item.key, item.value]
      }
      return [item.key, formatValue(item.value)]
    })

  const getParallelSettings = () => parallelSettingsVal.map((item) => [item.key, item.value])

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
      ['work_mem', formatValue(workMemVal)]
    ]
      .concat(getCheckpointSegments())
      .concat(getParallelSettings())

    return configData
      .filter((item) => !!item[1])
      .map((item) =>
        isAlterSystem ? `ALTER SYSTEM SET\n ${item[0]} = '${item[1]}';` : `${item[0]} = ${item[1]}`
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
      <React.Fragment>
        {isAlterSystem ? (
          <p>
            <strong>ALTER SYSTEM</strong> writes the given parameter setting to the{' '}
            <strong>postgresql.auto.conf</strong> file, which is read in addition to{' '}
            <strong>postgresql.conf</strong>
          </p>
        ) : (
          <p>
            Add/modify this settings in <strong>postgresql.conf</strong> and restart database
          </p>
        )}
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
      </React.Fragment>
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
