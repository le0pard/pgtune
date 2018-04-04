import {connect} from 'react-redux'
import MainGenerator from 'components/mainGenerator'
import {isReadyForConfiguration} from 'selectors/configuration'

const mapStateToProps = (state) => ({
  isReadyForConfiguration: isReadyForConfiguration(state)
})

export default connect(
  mapStateToProps
)(MainGenerator)
