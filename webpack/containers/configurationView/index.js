import {connect} from 'react-redux'
import ConfigurationView from 'components/configurationView'
import {
  isMinForConfiguration,
  maxConnections,
  sharedBuffers,
  effectiveCacheSize,
  maintenanceWorkMem
} from 'selectors/configuration'

const mapStateToProps = (state) => ({
  isMinForConfiguration: isMinForConfiguration(state),
  maxConnections: maxConnections(state),
  sharedBuffers: sharedBuffers(state),
  effectiveCacheSize: effectiveCacheSize(state),
  maintenanceWorkMem: maintenanceWorkMem(state),
  theme: state.settings.theme
})

export default connect(
  mapStateToProps
)(ConfigurationView)
