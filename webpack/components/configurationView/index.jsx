import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import SyntaxHighlighter from 'react-syntax-highlighter'
import {
  solarizedLight,
  solarizedDark
} from 'react-syntax-highlighter/styles/hljs'
import {APP_THEMES_LIGHT, APP_THEMES_DARK} from 'reducers/settings/constants'

import './configuration-view.sass'

const KB_UNIT_MAP = {
  KB_PER_MB: 1024,
  KB_PER_GB: 1048576
}

export default class ConfigurationView extends React.Component {
  static propTypes = {
    isMinForConfiguration: PropTypes.bool.isRequired,
    maxConnections: PropTypes.number.isRequired,
    effectiveCacheSize: PropTypes.number.isRequired,
    theme: PropTypes.oneOf([APP_THEMES_LIGHT, APP_THEMES_DARK]).isRequired
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

  postgresqlConfig() {
    const {
      maxConnections,
      effectiveCacheSize
    } = this.props

    return [
      `max_connections = ${maxConnections}`,
      `effective_cache_size = ${this.formatValue(effectiveCacheSize)}`
    ].join("\n")
  }

  render() {
    const {isMinForConfiguration, theme} = this.props
    if (!isMinForConfiguration) {
      return null
    }

    const codeHighlightStyle = (
      APP_THEMES_LIGHT === theme ? solarizedLight : solarizedDark
    )

    return (
      <div>
        <h4 className="configuration-view-title">
          Results
        </h4>
        <SyntaxHighlighter language="ini" style={codeHighlightStyle}>
          {this.postgresqlConfig()}
        </SyntaxHighlighter>
      </div>
    )
  }
}
