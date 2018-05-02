import {connect} from 'react-redux'
import ConfigurationView from 'components/configurationView'
import {
  maxConnections,
  sharedBuffers,
  effectiveCacheSize,
  maintenanceWorkMem,
  checkpointSegments,
  checkpointCompletionTarget,
  walBuffers,
  defaultStatisticsTarget,
  randomPageCost,
  effectiveIoConcurrency,
  parallelSettings,
  workMem,
  warningInfoMessages,
  kernelShmmax,
  kernelShmall
} from 'selectors/configuration'
import {openConfigTab} from 'reducers/settings'

const mapStateToProps = (state) => ({
  // hardware configuration
  dbVersion: state.configuration.dbVersion,
  osType: state.configuration.osType,
  dbType: state.configuration.dbType,
  totalMemory: state.configuration.totalMemory,
  totalMemoryUnit: state.configuration.totalMemoryUnit,
  cpuNum: state.configuration.cpuNum,
  connectionNum: state.configuration.connectionNum,
  hdType: state.configuration.hdType,
  // computed settings
  maxConnections: maxConnections(state),
  sharedBuffers: sharedBuffers(state),
  effectiveCacheSize: effectiveCacheSize(state),
  maintenanceWorkMem: maintenanceWorkMem(state),
  checkpointSegments: checkpointSegments(state),
  checkpointCompletionTarget: checkpointCompletionTarget(state),
  walBuffers: walBuffers(state),
  defaultStatisticsTarget: defaultStatisticsTarget(state),
  randomPageCost: randomPageCost(state),
  effectiveIoConcurrency: effectiveIoConcurrency(state),
  parallelSettings: parallelSettings(state),
  workMem: workMem(state),
  // warnings
  warningInfoMessages: warningInfoMessages(state),
  // kernel settings
  kernelShmmax: kernelShmmax(state),
  kernelShmall: kernelShmall(state),
  // tab state
  tabState: state.settings.tabState,
  // app theme
  theme: state.settings.theme
})

const mapDispatchToProps = (dispatch) => ({
  handleClickTab: (tab) => dispatch(openConfigTab(tab))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigurationView)
