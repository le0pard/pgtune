import React, {useEffect, useRef} from 'react'
import PropTypes from 'prop-types'
import {useDispatch, useSelector} from 'react-redux'
import {settingsToggleTheme} from 'reducers/settings'
import LocalStorage from 'lib/localStorage'
import {APP_THEMES_LIGHT, APP_THEMES_DARK} from 'reducers/settings/constants'

const ThemeSwitcher = ({className = ''}) => {
  const htmlRoot = useRef()
  const dispatch = useDispatch()
  const theme = useSelector(({settings}) => settings.theme)

  useEffect(() => {
    htmlRoot.current = document.querySelector(':root')
  }, [])

  useEffect(() => {
    if (htmlRoot.current) {
      htmlRoot.current.className = theme
    }
  }, [theme])

  const handleToggleTheme = (e) => {
    e.preventDefault()

    dispatch(settingsToggleTheme())
    LocalStorage.setItem(
      'theme',
      APP_THEMES_LIGHT === theme ? APP_THEMES_DARK : APP_THEMES_LIGHT
    )
  }

  return (
    <a
      onClick={handleToggleTheme}
      href="#"
      className={className}
    >
      {theme}
    </a>
  )
}

ThemeSwitcher.propTypes = {
  className: PropTypes.string
}

export default ThemeSwitcher
