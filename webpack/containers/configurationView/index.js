import {connect} from 'react-redux'
import ConfigurationView from 'components/configurationView'
import {
  isMinForConfiguration,
  maxConnections,
  effectiveCacheSize
} from 'selectors/configuration'

const mapStateToProps = (state) => ({
  isMinForConfiguration: isMinForConfiguration(state),
  maxConnections: maxConnections(state),
  effectiveCacheSize: effectiveCacheSize(state),
  theme: state.settings.theme
})

export default connect(
  mapStateToProps
)(ConfigurationView)
