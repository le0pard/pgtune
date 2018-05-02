import {connect} from 'react-redux'
import {settingsToggleTheme} from 'reducers/settings'
import {APP_THEMES_LIGHT, APP_THEMES_DARK} from 'reducers/settings/constants'
import LocalStorage from 'lib/localStorage'
import ThemeSwitcher from 'components/themeSwitcher'

const mapStateToProps = (state) => ({
  theme: state.settings.theme
})

const mapDispatchToProps = (dispatch) => ({
  settingsToggleTheme: (prevTheme) => {
    dispatch(settingsToggleTheme())
    LocalStorage.setItem(
      'theme',
      APP_THEMES_LIGHT === prevTheme ? APP_THEMES_DARK : APP_THEMES_LIGHT
    )
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ThemeSwitcher)
