import React from 'react'
import PropTypes from 'prop-types'
import {APP_THEMES_LIGHT, APP_THEMES_DARK} from 'reducers/settings/constants'

export default class ThemeSwitcher extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    theme: PropTypes.oneOf([APP_THEMES_LIGHT, APP_THEMES_DARK]),
    settingsToggleTheme: PropTypes.func.isRequired
  }

  static defaultProps = {
    className: ''
  }

  constructor(props) {
    super(props)
    this.htmlRoot = document.querySelector(':root')
  }

  updateDomTheme() {
    if (this.htmlRoot) {
      const {theme} = this.props
      this.htmlRoot.className = theme
    }
  }

  componentDidMount() {
    this.updateDomTheme()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.theme !== this.props.theme) {
      this.updateDomTheme()
    }
  }

  handleToggleTheme(e) {
    e.preventDefault()
    const {theme, settingsToggleTheme} = this.props
    settingsToggleTheme(theme)
  }

  render() {
    const {className, theme} = this.props

    return (
      <a
        onClick={this.handleToggleTheme.bind(this)}
        href="#"
        className={className}>{theme}</a>
    )
  }
}
