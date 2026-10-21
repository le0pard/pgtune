import { Fragment, useCallback, useRef } from 'react'
import classnames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { settingDescription, settingDocsUrl } from './settingsDocs'
import CopyButton from '@common/components/copyButton'
import { TAB_CONFIG, TAB_ALTER_SYSTEM } from '@features/settings/constants'
import {
  selectDBVersion,
  selectHardwareConfiguration,
  selectSettings,
  selectWarningInfoMessages,
  selectRestartRequiredSettings
} from '@features/configuration/configurationSlice'
import {
  configurationText,
  groupWarnings,
  TOKEN_NAME
} from '@features/configuration/configurationText'
import {
  openConfigTab,
  toggleIncludeWarnings,
  selectTabSettings,
  selectIncludeWarningsSettings
} from '@features/settings/settingsSlice'

import './configuration-view.css'

const CONFIGURATION_TABS = [
  { id: TAB_CONFIG, label: 'postgresql.conf' },
  { id: TAB_ALTER_SYSTEM, label: 'ALTER SYSTEM' }
]

// highlighted segment, setting name links to PostgreSQL documentation
const renderSegment = (segment, index, dbVersion) => {
  if (!segment.token) {
    return segment.text
  }

  const className = `configuration-code__${segment.token}`
  const docsUrl = segment.token === TOKEN_NAME ? settingDocsUrl(segment.text, dbVersion) : null

  if (docsUrl) {
    return (
      <a
        key={index}
        className={className}
        href={docsUrl}
        title={settingDescription(segment.text)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {segment.text}
      </a>
    )
  }

  return (
    <span key={index} className={className}>
      {segment.text}
    </span>
  )
}

const renderLines = (lines, dbVersion) =>
  lines.map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {lineIndex > 0 && '\n'}
      {line.map((segment, segmentIndex) => renderSegment(segment, segmentIndex, dbVersion))}
    </Fragment>
  ))

const ConfigurationView = () => {
  const dispatch = useDispatch()

  const dbVersion = useSelector(selectDBVersion)
  // provided parameters and generated settings
  const hardware = useSelector(selectHardwareConfiguration)
  const settings = useSelector(selectSettings)
  const restartRequiredSettings = useSelector(selectRestartRequiredSettings)
  // warnings
  const warningInfoMessagesVal = useSelector(selectWarningInfoMessages)
  // tab state
  const tabState = useSelector(selectTabSettings)
  // include warnings in copied configuration
  const includeWarnings = useSelector(selectIncludeWarningsSettings)
  // tab click state
  const handleClickTab = useCallback((tab) => dispatch(openConfigTab(tab)), [dispatch])
  const tabRefs = useRef({})
  const handleToggleIncludeWarnings = useCallback(
    () => dispatch(toggleIncludeWarnings()),
    [dispatch]
  )

  const isAlterSystem = TAB_ALTER_SYSTEM === tabState

  const warningGroups = groupWarnings(warningInfoMessagesVal)

  // arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern)
  const handleTabKeyDown = (e) => {
    const currentIndex = CONFIGURATION_TABS.findIndex((tab) => tab.id === tabState)
    const nextIndex = {
      ArrowRight: (currentIndex + 1) % CONFIGURATION_TABS.length,
      ArrowLeft: (currentIndex - 1 + CONFIGURATION_TABS.length) % CONFIGURATION_TABS.length,
      Home: 0,
      End: CONFIGURATION_TABS.length - 1
    }[e.key]

    if (nextIndex === undefined) {
      return
    }

    e.preventDefault()
    const nextTab = CONFIGURATION_TABS[nextIndex].id
    handleClickTab(nextTab)
    tabRefs.current[nextTab]?.focus()
  }

  const renderTabs = () => {
    return (
      <div
        className="configuration-view-tabs-wrapper"
        role="tablist"
        aria-label="Configuration format"
      >
        {CONFIGURATION_TABS.map((tab) => {
          const isSelected = tab.id === tabState
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[tab.id] = element
              }}
              id={`configurationTab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="configurationTabPanel"
              tabIndex={isSelected ? 0 : -1}
              className={classnames('configuration-view-tab', {
                'configuration-view-tab--active': isSelected
              })}
              onClick={() => handleClickTab(tab.id)}
              onKeyDown={handleTabKeyDown}
            >
              {tab.label}
            </button>
          )
        })}
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
    const { lines, copyText } = configurationText({
      hardware,
      settings,
      warnings: warningInfoMessagesVal,
      restartRequiredSettings,
      isAlterSystem,
      includeWarnings
    })

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
          <CopyButton className="configuration-view-copy-top-button" text={copyText} label="Copy" />
          <pre
            style={{ display: 'block', overflowX: 'auto', padding: '0.5rem' }}
            role="region"
            aria-label="Generated configuration"
            tabIndex={0}
          >
            <code style={{ whiteSpace: 'pre' }}>{renderLines(lines, dbVersion)}</code>
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
            text={copyText}
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

  return (
    <div>
      {renderTabs()}
      <div
        id="configurationTabPanel"
        role="tabpanel"
        aria-labelledby={`configurationTab-${tabState}`}
      >
        {renderConfigResult()}
      </div>
    </div>
  )
}

export default ConfigurationView
