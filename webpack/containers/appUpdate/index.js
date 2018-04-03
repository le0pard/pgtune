import {connect} from 'react-redux'
import AppUpdate from 'components/appUpdate'

const mapStateToProps = (state) => ({
  isNewVersionAvailable: state.sw.isNewVersionAvailable
})

export default connect(
  mapStateToProps
)(AppUpdate)
