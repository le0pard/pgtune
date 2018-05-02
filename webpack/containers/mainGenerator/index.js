import {connect} from 'react-redux'
import MainGenerator from 'components/mainGenerator'
import {isReadyForConfiguration} from 'selectors/configuration'
import {resetConfiguration} from 'reducers/configuration'

const mapStateToProps = (state) => ({
  isReadyForConfiguration: isReadyForConfiguration(state)
})

const mapDispatchToProps = (dispatch) => ({
  resetConfiguration: () => dispatch(resetConfiguration())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainGenerator)
