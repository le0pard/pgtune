import {connect} from 'react-redux'
import {updating} from 'reducers/sw'
import AppUpdate from 'components/appUpdate'

const mapStateToProps = (state) => ({
  isNewVersionAvailable: state.sw.isNewVersionAvailable
})

const mapDispatchToProps = (dispatch) => ({
  updatingSw: () => dispatch(updating())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppUpdate)
