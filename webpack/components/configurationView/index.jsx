import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter'
import iniLang from 'react-syntax-highlighter/dist/languages/hljs/ini'
import sqlLang from 'react-syntax-highlighter/dist/languages/hljs/sql'
import solarizedLight from 'react-syntax-highlighter/dist/styles/hljs/solarized-light'
import solarizedDark from 'react-syntax-highlighter/dist/styles/hljs/solarized-dark'
import CopyButton from 'components/copyButton'
import {OS_LINUX} from 'reducers/configuration/constants'
import {
  APP_THEMES_LIGHT,
  APP_THEMES_DARK,
  TAB_CONFIG,
  TAB_ALTER_SYSTEM,
  TAB_KERNEL_INFO
} from 'reducers/settings/constants'

import './configuration-view.sass'

SyntaxHighlighter.registerLanguage('ini', iniLang)
SyntaxHighlighter.registerLanguage('sql', sqlLang)

const KB_UNIT_MAP = {
  KB_PER_MB: 1024,
  KB_PER_GB: 1048576
}

export default class ConfigurationView extends React.Component {
  static propTypes = {
    dbVersion: PropTypes.number.isRequired,
    osType: PropTypes.string.isRequired,
    dbType: PropTypes.string.isRequired,
    totalMemory: PropTypes.number.isRequired,
    totalMemoryUnit: PropTypes.string.isRequired,
    cpuNum: PropTypes.number,
    connectionNum: PropTypes.number,
    hdType: PropTypes.string.isRequired,
    maxConnections: PropTypes.number.isRequired,
    sharedBuffers: PropTypes.number.isRequired,
    effectiveCacheSize: PropTypes.number.isRequired,
    maintenanceWorkMem: PropTypes.number.isRequired,
    checkpointSegments: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })),
    checkpointCompletionTarget: PropTypes.number.isRequired,
    walBuffers: PropTypes.number.isRequired,
    defaultStatisticsTarget: PropTypes.number.isRequired,
    randomPageCost: PropTypes.number.isRequired,
    effectiveIoConcurrency: PropTypes.number,
    parallelSettings: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })),
    workMem: PropTypes.number.isRequired,
    warningInfoMessages: PropTypes.arrayOf(PropTypes.string.isRequired),
    kernelShmmax: PropTypes.number.isRequired,
    kernelShmall: PropTypes.number.isRequired,
    tabState: PropTypes.string.isRequired,
    theme: PropTypes.oneOf([APP_THEMES_LIGHT, APP_THEMES_DARK]).isRequired,
    handleClickTab: PropTypes.func.isRequired
  }

  warningInfo() {
    const {warningInfoMessages} = this.props
    return warningInfoMessages.join("\n") // eslint-disable-line quotes
  }

  // This uses larger units only if there's no loss of resolution in displaying
  // with that value. Therefore, if using this to output newly assigned
  // values, that value needs to be rounded appropriately if you want
  // it to show up as an even number of MB or GB
  formatValue(value) {
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

  hardwareConfiguration() {
    const {
      dbVersion,
      osType,
      dbType,
      totalMemory,
      totalMemoryUnit,
      cpuNum,
      connectionNum,
      hdType
    } = this.props

    return [
      ['DB Version', dbVersion],
      ['OS Type', osType],
      ['DB Type', dbType],
      ['Total Memory (RAM)', `${totalMemory} ${totalMemoryUnit}`],
      ['CPUs num', cpuNum],
      ['Connections num', connectionNum],
      ['Data Storage', hdType]
    ].filter((item) => !!item[1])
      .map((item) => `# ${item[0]}: ${item[1]}`).join("\n") // eslint-disable-line quotes
  }

  getCheckpointSegments() {
    const {checkpointSegments} = this.props
    return checkpointSegments.map((item) => {
      if (item.key === 'checkpoint_segments') {
        return [item.key, item.value]
      }
      return [item.key, this.formatValue(item.value)]
    })
  }

  getParallelSettings() {
    const {parallelSettings} = this.props
    return parallelSettings.map((item) => [item.key, item.value])
  }

  postgresqlConfig() {
    const {
      tabState,
      maxConnections,
      sharedBuffers,
      effectiveCacheSize,
      maintenanceWorkMem,
      checkpointCompletionTarget,
      walBuffers,
      defaultStatisticsTarget,
      randomPageCost,
      effectiveIoConcurrency,
      workMem
    } = this.props

    const isRenderAlterSystem = TAB_ALTER_SYSTEM === tabState

    const configData = [
      ['max_connections', maxConnections],
      ['shared_buffers', this.formatValue(sharedBuffers)],
      ['effective_cache_size', this.formatValue(effectiveCacheSize)],
      ['maintenance_work_mem', this.formatValue(maintenanceWorkMem)],
      ['checkpoint_completion_target', checkpointCompletionTarget],
      ['wal_buffers', this.formatValue(walBuffers)],
      ['default_statistics_target', defaultStatisticsTarget],
      ['random_page_cost', randomPageCost],
      ['effective_io_concurrency', effectiveIoConcurrency],
      ['work_mem', this.formatValue(workMem)]
    ].concat(this.getCheckpointSegments()).concat(this.getParallelSettings())

    return configData.filter((item) => !!item[1])
      .map((item) => (
        isRenderAlterSystem ?
          `ALTER SYSTEM SET\n ${item[0]} = '${item[1]}';` :
          `${item[0]} = ${item[1]}`
      )).join("\n") // eslint-disable-line quotes
  }

  generateConfig() {
    const {warningInfoMessages} = this.props
    let config = [
      this.hardwareConfiguration(),
      '',
      this.postgresqlConfig()
    ]

    if (warningInfoMessages.length > 0) {
      config = [this.warningInfo(), '', ...config]
    }
    return config.join("\n") // eslint-disable-line quotes
  }

  renderTabs() {
    const {dbVersion, osType, tabState, handleClickTab} = this.props
    const showAlterSystemTab = dbVersion >= 9.4
    const showKernelTab = OS_LINUX === osType && dbVersion <= 9.2
    const singleTab = !showAlterSystemTab && !showKernelTab

    return (
      <div className="configuration-view-tabs-wrapper">
        <div className={classnames('configuration-view-tab', {
          'configuration-view-tab--active': TAB_CONFIG === tabState,
          'configuration-view-tab--full': singleTab
        })} onClick={() => handleClickTab(TAB_CONFIG)}>
          postgresql.conf
        </div>
        {showAlterSystemTab && <div className={classnames('configuration-view-tab', {
          'configuration-view-tab--active': TAB_ALTER_SYSTEM === tabState
        })} onClick={() => handleClickTab(TAB_ALTER_SYSTEM)}>
          ALTER SYSTEM
        </div>}
        {showKernelTab && <div className={classnames('configuration-view-tab', {
          'configuration-view-tab--active': TAB_KERNEL_INFO === tabState
        })} onClick={() => handleClickTab(TAB_KERNEL_INFO)}>
          Kernel settings
        </div>}
      </div>
    )
  }

  renderKernelInfo(codeHighlightStyle) {
    const {dbVersion, kernelShmall, kernelShmmax} = this.props
    const config = [
      `kernel.shmmax=${kernelShmmax}`,
      `kernel.shmall=${kernelShmall}`
    ].join("\n") // eslint-disable-line quotes

    return (
      <div>
        <p>
          <strong>NOTICE:</strong> For PostgreSQL {dbVersion} you also
          should modify kernel resources (add this in /etc/sysctl.conf)
        </p>
        <SyntaxHighlighter language="init" style={codeHighlightStyle}>
          {config}
        </SyntaxHighlighter>
        <a href="https://www.postgresql.org/docs/current/static/kernel-resources.html" target="_blank">
          More info
        </a>
      </div>
    )
  }

  renderConfigResult(codeHighlightStyle) {
    const {tabState} = this.props
    const isAlterSystem = TAB_ALTER_SYSTEM === tabState
    const generatedConfig = this.generateConfig()

    return (
      <React.Fragment>
        {isAlterSystem ?
          <p><strong>ALTER SYSTEM</strong> writes the given parameter setting to the <strong>postgresql.auto.conf</strong> file, which is read in addition to <strong>postgresql.conf</strong></p> :
          <p>Add/modify this settings in <strong>postgresql.conf</strong> and restart database</p>}
        <SyntaxHighlighter language={isAlterSystem ? 'sql' : 'ini'} style={codeHighlightStyle}>
          {generatedConfig}
        </SyntaxHighlighter>
        <div className="configuration-view-copy-wrapper">
          <CopyButton className="configuration-view-copy-button"
            text={generatedConfig} label="Copy configuration" />
        </div>
      </React.Fragment>
    )
  }

  render() {
    const {tabState, theme} = this.props

    const isKernelInfo = TAB_KERNEL_INFO === tabState
    const codeHighlightStyle = (
      APP_THEMES_LIGHT === theme ? solarizedLight : solarizedDark
    )

    return (
      <div>
        {this.renderTabs()}
        {
          isKernelInfo ?
            this.renderKernelInfo(codeHighlightStyle) :
            this.renderConfigResult(codeHighlightStyle)
        }
      </div>
    )
  }
}
