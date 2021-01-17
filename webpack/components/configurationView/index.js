import React from 'react'
import classnames from 'classnames'
import {useDispatch, useSelector} from 'react-redux'
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter'
import iniLang from 'react-syntax-highlighter/dist/cjs/languages/hljs/ini'
import sqlLang from 'react-syntax-highlighter/dist/cjs/languages/hljs/sql'
import solarizedLight from 'react-syntax-highlighter/dist/cjs/styles/hljs/solarized-light'
import solarizedDark from 'react-syntax-highlighter/dist/cjs/styles/hljs/solarized-dark'
import CopyButton from 'components/copyButton'
import {
  APP_THEMES_LIGHT,
  TAB_CONFIG,
  TAB_ALTER_SYSTEM
} from 'reducers/settings/constants'
import {
  maxConnections,
  sharedBuffers,
  effectiveCacheSize,
  maintenanceWorkMem,
  checkpointSegments,
  checkpointCompletionTarget,
  walBuffers,
  defaultStatisticsTarget,
  randomPageCost,
  effectiveIoConcurrency,
  parallelSettings,
  workMem,
  warningInfoMessages
} from 'selectors/configuration'
import {openConfigTab} from 'reducers/settings'

import './configuration-view.sass'

SyntaxHighlighter.registerLanguage('ini', iniLang)
SyntaxHighlighter.registerLanguage('sql', sqlLang)

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

const ConfigurationView = () => {
  const dispatch = useDispatch()

  // hardware configuration
  const dbVersion = useSelector(({configuration}) => configuration.dbVersion)
  const osType = useSelector(({configuration}) => configuration.osType)
  const dbType = useSelector(({configuration}) => configuration.dbType)
  const totalMemory = useSelector(({configuration}) => configuration.totalMemory)
  const totalMemoryUnit = useSelector(({configuration}) => configuration.totalMemoryUnit)
  const cpuNum = useSelector(({configuration}) => configuration.cpuNum)
  const connectionNum = useSelector(({configuration}) => configuration.connectionNum)
  const hdType = useSelector(({configuration}) => configuration.hdType)
  // computed settings
  const maxConnectionsVal = useSelector(maxConnections)
  const sharedBuffersVal = useSelector(sharedBuffers)
  const effectiveCacheSizeVal = useSelector(effectiveCacheSize)
  const maintenanceWorkMemVal = useSelector(maintenanceWorkMem)
  const checkpointSegmentsVal = useSelector(checkpointSegments)
  const checkpointCompletionTargetVal = useSelector(checkpointCompletionTarget)
  const walBuffersVal = useSelector(walBuffers)
  const defaultStatisticsTargetVal = useSelector(defaultStatisticsTarget)
  const randomPageCostVal = useSelector(randomPageCost)
  const effectiveIoConcurrencyVal = useSelector(effectiveIoConcurrency)
  const parallelSettingsVal = useSelector(parallelSettings)
  const workMemVal = useSelector(workMem)
  // warnings
  const warningInfoMessagesVal = useSelector(warningInfoMessages)
  // tab state
  const tabState = useSelector(({settings}) => settings.tabState)
  // app theme
  const theme = useSelector(({settings}) => settings.theme)
  // tab click state
  const handleClickTab = (tab) => dispatch(openConfigTab(tab))

  const warningInfo = () => warningInfoMessagesVal.join("\n") // eslint-disable-line quotes

  const hardwareConfiguration = () => (
    [
      ['DB Version', dbVersion],
      ['OS Type', osType],
      ['DB Type', dbType],
      ['Total Memory (RAM)', `${totalMemory} ${totalMemoryUnit}`],
      ['CPUs num', cpuNum],
      ['Connections num', connectionNum],
      ['Data Storage', hdType]
    ].filter((item) => !!item[1])
      .map((item) => `# ${item[0]}: ${item[1]}`).join("\n") // eslint-disable-line quotes
  )

  const getCheckpointSegments = () => (
    checkpointSegmentsVal.map((item) => {
      if (item.key === 'checkpoint_segments') {
        return [item.key, item.value]
      }
      return [item.key, formatValue(item.value)]
    })
  )

  const getParallelSettings = () => parallelSettingsVal.map((item) => [item.key, item.value])

  const postgresqlConfig = () => {
    const isRenderAlterSystem = TAB_ALTER_SYSTEM === tabState

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
    ].concat(getCheckpointSegments()).concat(getParallelSettings())

    return configData.filter((item) => !!item[1])
      .map((item) => (
        isRenderAlterSystem ?
          `ALTER SYSTEM SET\n ${item[0]} = '${item[1]}';` :
          `${item[0]} = ${item[1]}`
      )).join("\n") // eslint-disable-line quotes
  }

  const generateConfig = () => {
    let config = [
      hardwareConfiguration(),
      '',
      postgresqlConfig()
    ]

    if (warningInfoMessagesVal.length > 0) {
      config = [warningInfo(), '', ...config]
    }
    return config.join("\n") // eslint-disable-line quotes
  }

  const renderTabs = () => {
    return (
      <div className="configuration-view-tabs-wrapper">
        <div className={classnames('configuration-view-tab', {
          'configuration-view-tab--active': TAB_CONFIG === tabState
        })} onClick={() => handleClickTab(TAB_CONFIG)}>
          postgresql.conf
        </div>
        <div className={classnames('configuration-view-tab', {
          'configuration-view-tab--active': TAB_ALTER_SYSTEM === tabState
        })} onClick={() => handleClickTab(TAB_ALTER_SYSTEM)}>
          ALTER SYSTEM
        </div>
      </div>
    )
  }

  const renderConfigResult = (codeHighlightStyle) => {
    const isAlterSystem = TAB_ALTER_SYSTEM === tabState
    const generatedConfigVal = generateConfig()

    return (
      <React.Fragment>
        {isAlterSystem ?
          <p><strong>ALTER SYSTEM</strong> writes the given parameter setting to the <strong>postgresql.auto.conf</strong> file, which is read in addition to <strong>postgresql.conf</strong></p> :
          <p>Add/modify this settings in <strong>postgresql.conf</strong> and restart database</p>}
        <SyntaxHighlighter language={isAlterSystem ? 'sql' : 'ini'} style={codeHighlightStyle}>
          {generatedConfigVal}
        </SyntaxHighlighter>
        <div className="configuration-view-copy-wrapper">
          <CopyButton className="configuration-view-copy-button"
            text={generatedConfigVal} label="Copy configuration" />
        </div>
      </React.Fragment>
    )
  }

  const codeHighlightStyle = (
    APP_THEMES_LIGHT === theme ? solarizedLight : solarizedDark
  )

  return (
    <div>
      {renderTabs()}
      {renderConfigResult(codeHighlightStyle)}
    </div>
  )
}

export default ConfigurationView
