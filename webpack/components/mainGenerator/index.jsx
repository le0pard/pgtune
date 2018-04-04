import React from 'react'
import PropTypes from 'prop-types'
import ConfigurationForm from 'containers/configurationForm'
import ConfigurationView from 'containers/configurationView'

import './main-generator.sass'

export default class MainGenerator extends React.Component {
  static propTypes = {
    isReadyForConfiguration: PropTypes.bool.isRequired
  }

  render() {
    const {isReadyForConfiguration} = this.props

    return (
      <div className="main-generator">
        <div className="main-generator-form-wrapper">
          <h4 className="main-generator-form-subtitle">
            Parameters of your system
          </h4>
          <ConfigurationForm />
        </div>
        <div className="main-generator-result-wrapper">
          {isReadyForConfiguration && <ConfigurationView />}
        </div>
      </div>
    )
  }
}
