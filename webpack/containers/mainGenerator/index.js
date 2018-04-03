import {connect} from 'react-redux'
import MainGenerator from 'components/mainGenerator'

const mapStateToProps = (state) => ({
  isHaveGeneratedKey: false
})

export default connect(
  mapStateToProps
)(MainGenerator)
