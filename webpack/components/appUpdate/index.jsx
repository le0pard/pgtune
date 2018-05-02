import React from 'react'
import PropTypes from 'prop-types'

import './app-update.sass'

export default class AppUpdate extends React.Component {
  static propTypes = {
    isNewVersionAvailable: PropTypes.bool.isRequired
  }

  reloadPage(e) {
    e.preventDefault()
    window.location.reload()
  }

  render() {
    const {isNewVersionAvailable} = this.props

    if (!isNewVersionAvailable) {
      return null
    }

    return (
      <div className="app-update">
        <h4 className="app-update__title">
          New version of application is available.
        </h4>
        <div className="app-update__link-wrapper">
          <a
            href="#"
            onClick={this.reloadPage.bind(this)}>
            Update application
          </a>
        </div>
      </div>
    )
  }
}
