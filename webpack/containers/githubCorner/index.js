import {connect} from 'react-redux'
import {APP_THEMES_LIGHT, APP_THEMES_DARK} from 'reducers/settings/constants'
import GithubCorner from 'components/githubCorner'

const mapStateToProps = (state) => ({
  theme: (
    APP_THEMES_LIGHT === state.settings.theme ?
      APP_THEMES_DARK :
      APP_THEMES_LIGHT
  )
})

export default connect(
  mapStateToProps
)(GithubCorner)
