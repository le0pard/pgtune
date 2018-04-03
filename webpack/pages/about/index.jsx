import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {APP_THEMES_LIGHT, APP_THEMES_DARK} from 'reducers/settings'

import './about.sass'

class AboutPage extends React.Component {
  static propTypes = {
    theme: PropTypes.oneOf([APP_THEMES_LIGHT, APP_THEMES_DARK])
  }

  render() {
    const {theme} = this.props

    return (
      <div className="algorithm-page">
        <p>
          <strong>Master Password is an algorithm used to generate unique passwords</strong> for websites, email accounts, or anything else based only on easily reproducible input.
  The goal is a process that avoids all the problems involved with other password solutions.
        </p>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  theme: state.settings.theme
})

export default connect(
  mapStateToProps
)(AboutPage)
